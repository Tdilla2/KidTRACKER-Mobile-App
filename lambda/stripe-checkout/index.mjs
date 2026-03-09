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

  // Handle GET requests (app-redirect) before parsing body
  if (event.httpMethod === "GET" && path.endsWith("/app-redirect")) {
    // handled below
  } else {
    // Parse body for POST endpoints
    var body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return respond(400, { error: "Invalid JSON" });
    }
  }

  // --- Create Checkout Session ---
  if (path.endsWith("/create-checkout-session")) {
    const { invoiceId, invoiceNumber, amount, childName, description, customerEmail, returnUrl } = body;

    if (!invoiceId || !amount) {
      return respond(400, { error: "invoiceId and amount are required" });
    }

    // Build success/cancel URLs — use our app-redirect endpoint to bounce back to the native app
    const apiBase = `https://${event.headers?.Host || event.requestContext?.domainName}/${event.requestContext?.stage || "prod"}`;
    const redirectBase = `${apiBase}/stripe/app-redirect`;
    const successUrl = `${redirectBase}?stripe_status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${redirectBase}?stripe_status=cancel`;

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
        success_url: successUrl,
        cancel_url: cancelUrl,
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
      console.log("Verify session:", sessionId, "payment_status:", session.payment_status, "status:", session.status);

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

  // --- App Redirect (GET) ---
  // Stripe redirects here after payment; this page opens the native app via intent URL
  if (path.endsWith("/app-redirect")) {
    const qs = event.queryStringParameters || {};
    const status = qs.stripe_status || "cancel";
    const sessionId = qs.session_id || "";
    const intentUrl = `intent://payment-complete?stripe_status=${status}&session_id=${encodeURIComponent(sessionId)}#Intent;scheme=com.kidtrackerapp.mobile;package=com.kidtrackerapp.mobile;end`;
    const customSchemeUrl = `com.kidtrackerapp.mobile://payment-complete?stripe_status=${status}&session_id=${encodeURIComponent(sessionId)}`;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Returning to KidTRACKER...</title>
<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f4ff;text-align:center}
.card{background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.1);max-width:360px}
a{display:inline-block;margin-top:1rem;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style>
</head><body><div class="card">
<h2>${status === "success" ? "Payment Successful!" : "Payment Cancelled"}</h2>
<p>Returning to KidTRACKER app...</p>
<a id="link" href="${intentUrl}">Tap here if not redirected</a>
</div>
<script>
// Try custom scheme first, then intent URL
window.location.href = "${customSchemeUrl}";
setTimeout(function(){ window.location.href = "${intentUrl}"; }, 500);
</script></body></html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  }

  return respond(404, { error: "Not found" });
}
