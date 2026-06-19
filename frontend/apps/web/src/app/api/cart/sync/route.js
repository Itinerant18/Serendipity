import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await request.json();
    const userId = session.user.id;

    // Clear existing cart items for this user
    await sql`DELETE FROM saved_carts WHERE user_id = ${userId}`;

    // Insert new cart items
    if (items && items.length > 0) {
      const productIds = items.map((item) => item.product_id);
      const titles = items.map((item) => item.title);
      const prices = items.map((item) => item.price);
      const images = items.map((item) => item.image);
      const quantities = items.map((item) => item.quantity);

      await sql`
        INSERT INTO saved_carts (user_id, product_id, product_title, price, image_url, quantity)
        SELECT ${userId}, * FROM UNNEST(
          ${productIds}::text[],
          ${titles}::text[],
          ${prices}::text[],
          ${images}::text[],
          ${quantities}::int[]
        )
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error syncing cart:", error);
    return Response.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ items: [] });
    }

    const userId = session.user.id;
    const items = await sql`
      SELECT product_id, product_title as title, price, image_url as image, quantity
      FROM saved_carts 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return Response.json({ items });
  } catch (error) {
    console.error("Error getting cart:", error);
    return Response.json({ error: "Failed to get cart" }, { status: 500 });
  }
}
