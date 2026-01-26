import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, shipping, stripeSessionId } = await request.json();
    const userId = session.user.id;

    if (!items || items.length === 0) {
      return Response.json({ error: "No items in order" }, { status: 400 });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
      return sum + price * item.quantity;
    }, 0);

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const [order] = await sql`
      INSERT INTO orders (
        user_id, order_number, total_amount, stripe_session_id,
        payment_status, shipping_name, shipping_address, shipping_city,
        shipping_state, shipping_zip, shipping_country
      )
      VALUES (
        ${userId}, ${orderNumber}, ${totalAmount}, ${stripeSessionId || null},
        'pending', ${shipping?.name || null}, ${shipping?.address || null},
        ${shipping?.city || null}, ${shipping?.state || null},
        ${shipping?.zip || null}, ${shipping?.country || "US"}
      )
      RETURNING *
    `;

    // Create order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id, product_id, product_title, price, quantity, image_url
        )
        VALUES (
          ${order.id}, ${item.product_id}, ${item.title}, ${item.price},
          ${item.quantity}, ${item.image}
        )
      `;
    }

    // Clear user's saved cart
    await sql`DELETE FROM saved_carts WHERE user_id = ${userId}`;

    return Response.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
