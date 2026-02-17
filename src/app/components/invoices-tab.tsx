import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import type { ChildData, InvoiceData } from "../hooks/useKidTrackerData";

interface InvoicesTabProps {
  child: ChildData;
  invoices: InvoiceData[];
  onPayInvoice?: (invoiceId: string) => Promise<void>;
}

export default function InvoicesTab({ child, invoices, onPayInvoice }: InvoicesTabProps) {
  const weeklyRate = 300;
  const dailyRate = 60;
  const monthlyRate = 1200;

  const [paying, setPaying] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const pendingInvoice = invoices.find((i) => i.status !== "Paid");

  const handlePay = async (invoiceId: string) => {
    setPaying(true);
    try {
      if (onPayInvoice) {
        await onPayInvoice(invoiceId);
      }
      setPaySuccess(invoiceId);
      setShowConfirm(null);
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
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
                <p className="text-gray-500 mb-2">Daily Rate</p>
                <p className="text-blue-600">${dailyRate}.00</p>
                <p className="text-gray-400 mt-2">Per day of attendance</p>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">Weekly Rate</p>
                <p className="text-blue-600">${weeklyRate}.00</p>
                <p className="text-gray-400 mt-2">For 5 days per week</p>
                <p className="text-gray-400">${dailyRate}/day equivalent</p>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">Monthly Rate</p>
                <p className="text-blue-600">${monthlyRate}.00</p>
                <p className="text-gray-400 mt-2">Unlimited attendance</p>
                <p className="text-gray-400">Best value for full-time care</p>
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
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Tuition</span>
                <span className="text-gray-900">${pendingInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-900">Total Due</span>
              <span className="text-blue-600">${pendingInvoice.amount.toFixed(2)}</span>
            </div>

            <div className="pt-2">
              <p className="text-gray-500">Due Date: {pendingInvoice.dueDate}</p>
            </div>

            {showConfirm === pendingInvoice.id ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-blue-900 text-center">
                  Confirm payment of <strong>${pendingInvoice.amount.toFixed(2)}</strong>?
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirm(null)}
                    disabled={paying}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePay(pendingInvoice.id)}
                    disabled={paying}
                  >
                    {paying ? "Processing..." : "Confirm Pay"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowConfirm(pendingInvoice.id)}
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-900">{pendingInvoice.invoiceNumber}</p>
                    <p className="text-gray-500">{new Date().toISOString().split("T")[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">${pendingInvoice.amount.toFixed(2)}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Paid
                    </Badge>
                  </div>
                </div>
              )}
              {paidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-gray-500">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">${invoice.amount.toFixed(2)}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
