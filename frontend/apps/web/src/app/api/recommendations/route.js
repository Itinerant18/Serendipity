import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { productTitle, productDescription, category } = await request.json();

    // Check cache first
    const cached = await sql`
      SELECT recommended_products 
      FROM product_recommendations 
      WHERE product_id = ${productTitle}
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (cached.length > 0 && cached[0].recommended_products) {
      return Response.json({ recommendations: cached[0].recommended_products });
    }

    // Call ChatGPT for recommendations
    const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful shopping assistant. Generate 3-5 product recommendation search queries based on the given product. Return ONLY search terms, one per line, no numbering or extra text.",
          },
          {
            role: "user",
            content: `Product: ${productTitle}\nDescription: ${productDescription || category || "N/A"}\n\nGenerate 3-5 related product search queries that would complement this product.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const searchQueries = data.choices[0].message.content
      .split("\n")
      .filter((q) => q.trim())
      .slice(0, 5);

    // Fetch actual products for each query
    const recommendations = [];
    for (const query of searchQueries) {
      try {
        const productResponse = await fetch(
          `/integrations/product-search/search?q=${encodeURIComponent(query)}&min_rating=4`,
        );
        const productData = await productResponse.json();

        if (productData.status === "OK" && productData.data.length > 0) {
          recommendations.push(productData.data[0]);
        }
      } catch (err) {
        console.error(`Error fetching products for query "${query}":`, err);
      }
    }

    // Cache results
    await sql`
      INSERT INTO product_recommendations (product_id, recommended_products, user_id)
      VALUES (${productTitle}, ${JSON.stringify(recommendations)}, NULL)
      ON CONFLICT DO NOTHING
    `;

    return Response.json({ recommendations });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return Response.json(
      { error: "Failed to get recommendations" },
      { status: 500 },
    );
  }
}
