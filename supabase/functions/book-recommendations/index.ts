const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, currentBook } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Call Lovable AI
    const systemPrompt = currentBook 
      ? `You are a book recommendation assistant. The user is currently reading or interested in: "${currentBook.title}" by ${currentBook.author}. 
      
Recommend 3-5 similar books that they might enjoy. For each recommendation:
1. Include the book title and author
2. Explain why it's similar or complementary
3. Mention the genre
4. Keep it concise and engaging

Format: Use clear paragraphs with book titles in quotes.`
      : `You are a book recommendation assistant. Provide personalized book suggestions based on the user's query.

For each recommendation:
1. Include the book title and author
2. Brief description (2-3 sentences)
3. Why it matches their request
4. Genre information

Be conversational and enthusiastic. Format with clear paragraphs.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: query,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("AI Gateway error:", response.status, await response.text());
      throw new Error("Failed to get AI recommendation");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "I couldn't generate a recommendation at this time.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in book-recommendations function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
