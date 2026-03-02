import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

export async function handler(event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return respond(200, {});
  }

  const path = event.path || event.resource || "";
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON" });
  }

  // --- Create Checkout Session ---
  if (path.endsWith("/create-checkout-session")) {
    const { invoiceId, invoiceNumber, amount, childName, description, customerEmail } = body;

    if (!invoiceId || !amount) {
      return respond(400, { error: "invoiceId and amount are required" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Invoice ${invoiceNumber || invoiceId}`,
                description: childName
                  ? `${childName} — ${description || "Tuition payment"}`
                  : description || "Tuition payment",
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        metadata: { invoiceId, invoiceNumber: invoiceNumber || "" },
        success_url: "http://localhost/?stripe_status=success&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost/?stripe_status=cancel",
      });

      return respond(200, { sessionId: session.id, url: session.url });
    } catch (err) {
      console.error("Stripe create session error:", err);
      return respond(500, { error: err.message });
    }
  }

  // --- Verify Payment ---
  if (path.endsWith("/verify-payment")) {
    const { sessionId } = body;

    if (!sessionId) {
      return respond(400, { error: "sessionId is required" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return respond(200, {
        paid: session.payment_status === "paid",
        invoiceId: session.metadata.invoiceId,
        invoiceNumber: session.metadata.invoiceNumber,
        amountTotal: session.amount_total,
        customerEmail: session.customer_details?.email || null,
      });
    } catch (err) {
      console.error("Stripe verify error:", err);
      return respond(500, { error: err.message });
    }
  }

  return respond(404, { error: "Not found" });
}
