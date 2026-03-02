import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import type { ChildData, InvoiceData } from "../hooks/useKidTrackerData";

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

interface InvoicesTabProps {
  child: ChildData;
  invoices: InvoiceData[];
  onPayInvoice?: (invoiceId: string) => Promise<void>;
}

export default function InvoicesTab({ child, invoices, onPayInvoice }: InvoicesTabProps) {
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

  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const pendingInvoice = invoices.find((i) => i.status !== "Paid");

  const handlePay = async (invoiceId: string) => {
    setPaying(true);
    try {
      if (onPayInvoice) {
        await onPayInvoice(invoiceId);
      }
      // If we reach here without a redirect, mark success locally (demo mode)
      setPaySuccess(invoiceId);
    } catch {
      alert("Could not initiate payment. Please try again.");
      setPaying(false);
    }
    // Don't reset paying state — the page will redirect to Stripe
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
      {pendingInvoice && paySuccess !== pendingInvoice.id ? (
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

            {paying ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-center text-sm">
                  Redirecting to secure payment...
                </p>
              </div>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handlePay(pendingInvoice.id)}
              >
                Pay Now
              </Button>
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

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {paidInvoices.length === 0 && !paySuccess ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No payment history yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paySuccess && pendingInvoice && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">{pendingInvoice.invoiceNumber}</p>
                      <p className="text-gray-500 text-sm">{new Date().toISOString().split("T")[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">${pendingInvoice.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Paid
                      </Badge>
                    </div>
                  </div>
                  {pendingInvoice.description && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      {parseLineItems(pendingInvoice.description).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {paidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-gray-500 text-sm">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">${invoice.amount.toFixed(2)}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                  {invoice.description && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      {parseLineItems(invoice.description).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{item.label}</span>
                          <span className="text-gray-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
