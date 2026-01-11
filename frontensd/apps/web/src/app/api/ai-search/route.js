export async function POST(request) {
  try {
    const { query, conversationHistory } = await request.json();

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // Use Gemini to understand user intent and generate search queries
    const messages = [
      {
        role: "system",
        content: `You are an AI shopping assistant for Serendipity, an e-commerce platform. Your job is to:
1. Understand what the user is looking for
2. Provide helpful product search suggestions
3. Generate specific search queries to find products

When responding, be conversational and helpful. If the user asks about a product category, suggest specific search terms.

Format your response as JSON with this structure:
{
  "response": "Your conversational response to the user",
  "searchQueries": ["query1", "query2", "query3"],
  "category": "optional category name"
}`,
      },
      ...(conversationHistory || []),
      {
        role: "user",
        content: query,
      },
    ];

    const geminiResponse = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        json_schema: {
          name: "shopping_assistant_response",
          schema: {
            type: "object",
            properties: {
              response: { type: "string" },
              searchQueries: {
                type: "array",
                items: { type: "string" },
              },
              category: { type: ["string", "null"] },
            },
            required: ["response", "searchQueries", "category"],
            additionalProperties: false,
          },
        },
      }),
    });

    const geminiData = await geminiResponse.json();
    const assistantResponse = JSON.parse(geminiData.choices[0].message.content);

    // Fetch products for the top search query
    let products = [];
    if (
      assistantResponse.searchQueries &&
      assistantResponse.searchQueries.length > 0
    ) {
      const topQuery = assistantResponse.searchQueries[0];
      try {
        const productResponse = await fetch(
          `/integrations/product-search/search?q=${encodeURIComponent(topQuery)}&min_rating=3`,
        );
        const productData = await productResponse.json();

        if (productData.status === "OK") {
          products = productData.data.slice(0, 8);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }

    return Response.json({
      response: assistantResponse.response,
      searchQueries: assistantResponse.searchQueries,
      category: assistantResponse.category,
      products,
    });
  } catch (error) {
    console.error("Error in AI search:", error);
    return Response.json(
      {
        error: "Failed to process search",
        response:
          "I'm sorry, I encountered an error. Please try rephrasing your question.",
        searchQueries: [],
        products: [],
      },
      { status: 500 },
    );
  }
}
