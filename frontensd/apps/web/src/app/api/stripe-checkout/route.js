import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, redirectURL } = await request.json();
    const userId = session.user.id;
    const email = session.user.email;

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Get or create Stripe customer
    const [user] = await sql`
      SELECT stripe_id FROM auth_users WHERE id = ${userId}
    `;

    let stripeCustomerId = user?.stripe_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;
      await sql`
        UPDATE auth_users SET stripe_id = ${stripeCustomerId} WHERE id = ${userId}
      `;
    }

    // Prepare line items for Stripe
    const lineItems = items.map((item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectURL,
    });

    return Response.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
