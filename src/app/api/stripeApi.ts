// Stripe Checkout API helpers
// Update this URL after deploying the Lambda + API Gateway
const STRIPE_API_BASE = "https://xjpbm8si5m.execute-api.us-east-1.amazonaws.com/prod";

export interface CreateCheckoutSessionRequest {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  childName: string;
  description: string;
  customerEmail: string;
  returnUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface VerifyPaymentResponse {
  paid: boolean;
  invoiceId: string;
  invoiceNumber: string;
  amountTotal: number;
  customerEmail: string | null;
}

export async function createCheckoutSession(
  data: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const res = await fetch(`${STRIPE_API_BASE}/stripe/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Stripe API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function verifyPayment(
  sessionId: string
): Promise<VerifyPaymentResponse> {
  const res = await fetch(`${STRIPE_API_BASE}/stripe/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Stripe API error ${res.status}: ${err}`);
  }
  return res.json();
}
