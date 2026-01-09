import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all orders for user
    const orders = await sql`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.payment_status,
        o.created_at,
        o.shipping_name,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_zip
      FROM orders o
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `;

    // Get items for each order
    for (const order of orders) {
      const items = await sql`
        SELECT product_id, product_title, price, quantity, image_url
        FROM order_items
        WHERE order_id = ${order.id}
      `;
      order.items = items;
    }

    return Response.json({ orders });
  } catch (error) {
    console.error("Error getting order history:", error);
    return Response.json(
      { error: "Failed to get order history" },
      { status: 500 },
    );
  }
}
