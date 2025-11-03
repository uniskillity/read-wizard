import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { searchBooks, GoogleBook } from "@/lib/googleBooks";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Recommendations = () => {
  const [session, setSession] = useState<any>(null);
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadRecommendations();
    }
  }, [session]);

  const loadRecommendations = async () => {
    try {
      // Get user's reading history to personalize
      const { data: history } = await supabase
        .from("reading_history")
        .select("book_id")
        .eq("user_id", session.user.id)
        .limit(5);

      // Get AI recommendations
      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "book-recommendations",
        {
          body: { query: "Give me personalized book recommendations based on my reading history" },
        }
      );

      if (!aiError && aiData?.response) {
        setAiRecommendation(aiData.response);
      }

      // Get popular books as fallback
      const popularBooks = await searchBooks("bestseller fiction", 20);
      setBooks(popularBooks);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8 animate-fade-in">AI Recommendations</h1>

        {aiRecommendation && (
          <Card className="mb-8 animate-fade-in shadow-book">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {aiRecommendation}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-serif font-bold mb-6">Curated For You</h2>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading recommendations...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {books.map((book) => (
              <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="cursor-pointer">
                <BookCard
                  id={book.id}
                  title={book.volumeInfo.title}
                  author={book.volumeInfo.authors?.join(", ") || "Unknown"}
                  description={book.volumeInfo.description}
                  genre={book.volumeInfo.categories?.[0] || "General"}
                  rating={book.volumeInfo.averageRating}
                  imageUrl={book.volumeInfo.imageLinks?.thumbnail}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
