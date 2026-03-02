import { useState, useEffect } from "react";
import type { RawAppUser } from "./api/kidTrackerApi";
import { updateInvoiceApi } from "./api/kidTrackerApi";
import { verifyPayment } from "./api/stripeApi";
import LoginScreen from "./components/login-screen";
import Dashboard from "./components/dashboard";

export interface PaymentResult {
  type: "success" | "cancel" | "error";
  message: string;
}

/** Check URL for Stripe redirect params and clean them up. */
function consumeStripeParams(): {
  status: string | null;
  sessionId: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("stripe_status");
  const sessionId = params.get("session_id");

  if (status) {
    // Remove query params without a full page reload
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return { status, sessionId };
}

export default function App() {
  const [user, setUser] = useState<RawAppUser | null>(() => {
    const stored = localStorage.getItem("kidtracker_user");
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });
  const [isDemo, setIsDemo] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Handle Stripe return redirect on mount
  useEffect(() => {
    const { status, sessionId } = consumeStripeParams();
    if (!status) return;

    if (status === "cancel") {
      setPaymentResult({ type: "cancel", message: "Payment was cancelled." });
      localStorage.removeItem("kidtracker_pending_payment");
      return;
    }

    if (status === "success" && sessionId) {
      setPaymentResult({ type: "success", message: "Verifying payment..." });

      verifyPayment(sessionId)
        .then(async (result) => {
          if (result.paid) {
            // Mark invoice as paid in the backend
            await updateInvoiceApi(result.invoiceId, {
              status: "Paid",
              paid_at: new Date().toISOString(),
              stripe_session_id: sessionId,
            });
            setPaymentResult({
              type: "success",
              message: `Payment of $${(result.amountTotal / 100).toFixed(2)} successful! Thank you.`,
            });
            // Trigger dashboard data reload so invoice shows as Paid
            setReloadKey((k) => k + 1);
          } else {
            setPaymentResult({
              type: "error",
              message: "Payment was not completed. Please try again.",
            });
          }
          localStorage.removeItem("kidtracker_pending_payment");
        })
        .catch((err) => {
          console.error("Payment verification failed:", err);
          setPaymentResult({
            type: "error",
            message: "Could not verify payment. Please contact your daycare.",
          });
        });
    }
  }, []);

  const handleLogin = (appUser: RawAppUser) => {
    localStorage.setItem("kidtracker_user", JSON.stringify(appUser));
    setUser(appUser);
  };

  const handleDemo = () => {
    setIsDemo(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("kidtracker_user");
    setUser(null);
    setIsDemo(false);
  };

  if (!user && !isDemo) {
    return <LoginScreen onLogin={handleLogin} onDemo={handleDemo} />;
  }

  return (
    <Dashboard
      onLogout={handleLogout}
      userId={user?.id ?? ""}
      daycareId={user?.daycare_id ?? ""}
      userName={user?.full_name ?? "Parent"}
      isDemo={isDemo}
      paymentResult={paymentResult}
      onDismissPaymentResult={() => setPaymentResult(null)}
      reloadKey={reloadKey}
    />
  );
}
