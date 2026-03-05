import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import type { ChildData, InvoiceData } from "../hooks/useKidTrackerData";
import type { PaymentResult } from "../App";

/** Parse an invoice description like "Monthly Tuition: $350.00, Registration Fee: $250.00"
 *  into an array of { label, amount } line items. */
function parseLineItems(description: string): { label: string; amount: string }[] {
  if (!description) return [];
  return description.split(",").map((part) => {
    const trimmed = part.trim();
    const colonIdx = trimmed.lastIndexOf(":");
    if (colonIdx === -1) return { label: trimmed, amount: "" };
    return {
      label: trimmed.slice(0, colonIdx).trim(),
      amount: trimmed.slice(colonIdx + 1).trim(),
    };
  });
}

/** Format a date string like "2026-01-15" or ISO timestamp to "Jan 15, 2026". */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface InvoicesTabProps {
  child: ChildData;
  invoices: InvoiceData[];
  onStartPayment?: (invoiceId: string) => Promise<string>;
  onConfirmPayment?: (sessionId: string) => Promise<boolean>;
  paymentReturn?: PaymentResult | null;
  onClearPaymentReturn?: () => void;
}

export default function InvoicesTab({ child, invoices, onStartPayment, onConfirmPayment, paymentReturn, onClearPaymentReturn }: InvoicesTabProps) {
  // Use the child's actual recurring charges from the dashboard
  const monthlyCharge = child.recurringCharges.find(
    (c) => c.description.toLowerCase().includes("month")
  );
  const weeklyCharge = child.recurringCharges.find(
    (c) => c.description.toLowerCase().includes("week")
  );
  const dailyCharge = child.recurringCharges.find(
    (c) => c.description.toLowerCase().includes("daily") || c.description.toLowerCase().includes("day")
  );

  // If only monthly is set, derive the others; if only weekly, derive from that, etc.
  const monthlyRate = monthlyCharge?.amount
    ?? (weeklyCharge ? weeklyCharge.amount * 4 : null)
    ?? (dailyCharge ? dailyCharge.amount * 20 : null)
    ?? (child.recurringCharges.length > 0 ? child.recurringCharges[0].amount : 0);
  const weeklyRate = weeklyCharge?.amount
    ?? (monthlyRate ? Math.round(monthlyRate / 4) : 0);
  const dailyRate = dailyCharge?.amount
    ?? (weeklyRate ? Math.round(weeklyRate / 5) : 0);

  const [payState, setPayState] = useState<"idle" | "creating" | "waiting" | "success" | "error">("idle");
  const [paySuccess, setPaySuccess] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Handle return from Stripe redirect — verify payment and update invoice in DB
  useEffect(() => {
    if (!paymentReturn) return;

    if (paymentReturn.type === "success" && paymentReturn.sessionId && onConfirmPayment) {
      setPayState("creating"); // Show a "verifying" state
      let cancelled = false;

      const verify = async () => {
        try {
          const paid = await onConfirmPayment(paymentReturn.sessionId!);
          if (cancelled) return;
          if (paid) {
            setPayState("success");
            setPaySuccess("stripe_redirect");
          } else {
            // Payment not yet confirmed — poll a few more times
            let attempts = 0;
            const poll = setInterval(async () => {
              attempts++;
              try {
                const result = await onConfirmPayment(paymentReturn.sessionId!);
                if (result || attempts >= 10) {
                  clearInterval(poll);
                  if (!cancelled) {
                    setPayState(result ? "success" : "error");
                    if (result) setPaySuccess("stripe_redirect");
                  }
                }
              } catch {
                if (attempts >= 10) {
                  clearInterval(poll);
                  if (!cancelled) setPayState("error");
                }
              }
            }, 3000);
          }
        } catch {
          if (!cancelled) setPayState("error");
        }
      };

      verify();
      onClearPaymentReturn?.();
      return () => { cancelled = true; };
    } else if (paymentReturn.type === "cancel") {
      setPayState("idle");
      onClearPaymentReturn?.();
    }
  }, [paymentReturn, onConfirmPayment, onClearPaymentReturn]);

  const paidInvoices = invoices.filter((i) => i.status.toLowerCase() === "paid");
  const allPendingInvoices = invoices.filter((i) => i.status.toLowerCase() !== "paid");
  const pendingInvoice = allPendingInvoices[0] ?? null;

  // Sort all invoices by date descending (newest first)
  const sortedInvoices = [...invoices].sort((a, b) => {
    const dateA = a.date || a.dueDate || "";
    const dateB = b.date || b.dueDate || "";
    return dateB.localeCompare(dateA);
  });

  const lastSessionRef = useRef<string | null>(null);

  const handlePay = async (invoiceId: string) => {
    if (!onStartPayment || !onConfirmPayment) return;

    setPayState("creating");
    try {
      // Create session and open Stripe in browser
      const sessionId = await onStartPayment(invoiceId);
      lastSessionRef.current = sessionId;
      setPayState("waiting");

      // Poll every 5 seconds to check if payment completed
      pollRef.current = setInterval(async () => {
        try {
          const paid = await onConfirmPayment(sessionId);
          if (paid) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setPayState("success");
            setPaySuccess(invoiceId);
          }
        } catch {
          // Ignore polling errors, keep trying
        }
      }, 5000);
    } catch {
      setPayState("error");
      setTimeout(() => setPayState("idle"), 3000);
    }
  };

  // Manual "Check Payment" for when user returns from browser
  const handleCheckPayment = async () => {
    const sid = lastSessionRef.current;
    if (!sid || !onConfirmPayment) return;
    setPayState("creating");
    try {
      const paid = await onConfirmPayment(sid);
      if (paid) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setPayState("success");
        setPaySuccess("manual_check");
      } else {
        setPayState("waiting");
      }
    } catch {
      setPayState("waiting");
    }
  };

  // Listen for invoices changing (e.g. browserFinished triggered confirmPayment)
  useEffect(() => {
    if (lastSessionRef.current && pendingInvoice === null) {
      // The pending invoice was paid via browserFinished handler
      setPayState("success");
      setPaySuccess("auto_verified");
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      lastSessionRef.current = null;
    }
  }, [invoices, pendingInvoice]);

  const handleCancel = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    lastSessionRef.current = null;
    setPayState("idle");
  };

  return (
    <div className="space-y-4">
      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Billing information for {child.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Parent Name</span>
            <span className="text-gray-900">{child.parentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Child</span>
            <span className="text-gray-900">{child.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Classroom</span>
            <span className="text-gray-900">{child.classroom}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tuition Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Tuition Rates</CardTitle>
          <CardDescription>Your current pricing plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-2">Daily Rate</p>
                <p className="text-blue-600 text-2xl font-semibold">${dailyRate.toFixed(2)}</p>
                <p className="text-gray-400 text-sm mt-2">Per day of attendance</p>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-2">Weekly Rate</p>
                <p className="text-blue-600 text-2xl font-semibold">${weeklyRate.toFixed(2)}</p>
                <p className="text-gray-400 text-sm mt-2">For 5 days per week</p>
                <p className="text-gray-400 text-sm">${dailyRate.toFixed(2)}/day equivalent</p>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-2">Monthly Rate</p>
                <p className="text-blue-600 text-2xl font-semibold">${monthlyRate.toFixed(2)}</p>
                <p className="text-gray-400 text-sm mt-2">Unlimited attendance</p>
                <p className="text-gray-400 text-sm">Best value for full-time care</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Invoice */}
      {pendingInvoice && payState !== "success" ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Invoice</CardTitle>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Due Soon
              </Badge>
            </div>
            <CardDescription>{pendingInvoice.invoiceNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {parseLineItems(pendingInvoice.description).length > 0 ? (
                parseLineItems(pendingInvoice.description).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-900">{item.amount}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tuition</span>
                  <span className="text-gray-900">${pendingInvoice.amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-900">Total Due</span>
              <span className="text-blue-600">${pendingInvoice.amount.toFixed(2)}</span>
            </div>

            <div className="pt-2">
              <p className="text-gray-500">Due Date: {pendingInvoice.dueDate}</p>
            </div>

            {payState === "idle" && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handlePay(pendingInvoice.id)}
              >
                Pay Now
              </Button>
            )}

            {payState === "creating" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-center text-sm">
                  {paySuccess === null ? "Opening secure payment..." : "Verifying payment..."}
                </p>
              </div>
            )}

            {payState === "waiting" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-blue-900 text-center text-sm font-medium">
                  Complete payment in the browser window
                </p>
                <p className="text-blue-700 text-center text-xs">
                  Already paid? Tap below to verify.
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCheckPayment}
                >
                  Check Payment Status
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            )}

            {payState === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 text-center text-sm">
                  Could not initiate payment. Please try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <svg className="w-16 h-16 text-green-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">
                {paySuccess ? "Payment successful! Thank you." : "No outstanding invoices."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All invoices and payments for {child.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          {invoices.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-green-700 text-lg font-semibold">
                  ${paidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                </p>
                <p className="text-green-600 text-xs">Total Paid</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-yellow-700 text-lg font-semibold">
                  ${allPendingInvoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
                </p>
                <p className="text-yellow-600 text-xs">Outstanding</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-blue-700 text-lg font-semibold">
                  {invoices.length}
                </p>
                <p className="text-blue-600 text-xs">Total Invoices</p>
              </div>
            </div>
          )}

          {sortedInvoices.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No invoices yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedInvoices.map((invoice) => {
                const isPaid = invoice.status.toLowerCase() === "paid";
                const isOverdue = !isPaid && invoice.dueDate && new Date(invoice.dueDate) < new Date();
                return (
                  <div
                    key={invoice.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-gray-500 text-xs">
                          Issued: {formatDate(invoice.date)}
                        </p>
                        {isPaid && invoice.paidAt && (
                          <p className="text-green-600 text-xs">
                            Paid: {formatDate(invoice.paidAt)}
                          </p>
                        )}
                        {!isPaid && invoice.dueDate && (
                          <p className={isOverdue ? "text-red-600 text-xs" : "text-yellow-600 text-xs"}>
                            Due: {formatDate(invoice.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-semibold">${invoice.amount.toFixed(2)}</p>
                        <Badge
                          variant="outline"
                          className={
                            isPaid
                              ? "bg-green-50 text-green-700 border-green-200"
                              : isOverdue
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    {invoice.description && (
                      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                        {parseLineItems(invoice.description).map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-500">{item.label}</span>
                            <span className="text-gray-600">{item.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
