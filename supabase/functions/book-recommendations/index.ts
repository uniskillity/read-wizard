import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const { query } = await req.json();

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

    // Initialize Supabase client to get user context and book data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's reading history and preferences
    const authHeader = req.headers.get("Authorization");
    let userContext = "";
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const [{ data: history }, { data: preferences }] = await Promise.all([
          supabase
            .from("reading_history")
            .select("books(*), rating, status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("user_preferences")
            .select("*")
            .eq("user_id", user.id)
            .single(),
        ]);

        if (history && history.length > 0) {
          const readBooks = history
            .map((h: any) => `${h.books.title} by ${h.books.author} (${h.rating ? h.rating + " stars" : h.status})`)
            .join(", ");
          userContext += `\n\nUser's reading history: ${readBooks}`;
        }

        if (preferences) {
          userContext += `\n\nUser preferences: Favorite genres: ${preferences.favorite_genres?.join(", ") || "none specified"}, Reading pace: ${preferences.reading_pace}, Interests: ${preferences.interests?.join(", ") || "none specified"}`;
        }
      }
    }

    // Get available books from database
    const { data: books } = await supabase
      .from("books")
      .select("title, author, description, genre, rating, published_year")
      .order("rating", { ascending: false })
      .limit(50);

    const booksContext = books
      ? `\n\nAvailable books in our library:\n${books
          .map(
            (b: any) =>
              `- "${b.title}" by ${b.author} (${b.genre}, ${b.rating}/5, ${b.published_year}): ${b.description?.substring(0, 100)}...`
          )
          .join("\n")}`
      : "";

    // Call Lovable AI
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
              content: `You are an expert book recommendation assistant with deep knowledge of literature across all genres. Your role is to provide personalized, thoughtful book recommendations based on user preferences, reading history, and their current query.

When recommending books:
1. Consider the user's reading history and preferences
2. Match books to their mood, interests, or specific requests
3. Provide 2-4 book recommendations with brief, engaging descriptions
4. Explain why each book would be a good match
5. Include the author, genre, and any relevant details
6. Be conversational and enthusiastic about books
7. If books are available in our library, prioritize those but you can also suggest others

Format your recommendations clearly with book titles in quotes, followed by the author and a compelling description.${userContext}${booksContext}`,
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
      JSON.stringify({ error: error.message || "An error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
