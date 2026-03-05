import { useState, useEffect } from "react";
import type { RawAppUser } from "./api/kidTrackerApi";
import LoginScreen from "./components/login-screen";
import Dashboard from "./components/dashboard";

export interface PaymentResult {
  type: "success" | "cancel" | "error";
  message: string;
  sessionId?: string;
}

/** Read and clear stripe_status / session_id from the URL after a Stripe redirect. */
function consumeStripeParams(): { status: string | null; sessionId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("stripe_status");
  const sessionId = params.get("session_id");
  if (status) {
    params.delete("stripe_status");
    params.delete("session_id");
    const clean = params.toString();
    const newUrl = window.location.pathname + (clean ? `?${clean}` : "");
    window.history.replaceState({}, "", newUrl);
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
  const [paymentReturn, setPaymentReturn] = useState<PaymentResult | null>(null);

  // On mount, check if we're returning from Stripe
  useEffect(() => {
    const { status, sessionId } = consumeStripeParams();
    if (status === "success" && sessionId) {
      setPaymentReturn({ type: "success", message: "Payment completed successfully!", sessionId });
    } else if (status === "cancel") {
      setPaymentReturn({ type: "cancel", message: "Payment was cancelled." });
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
      paymentReturn={paymentReturn}
      onClearPaymentReturn={() => setPaymentReturn(null)}
    />
  );
}
