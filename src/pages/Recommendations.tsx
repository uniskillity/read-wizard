import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, BookOpen } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  genre: string;
  rating: number | null;
  published_year: number | null;
  cover_url: string | null;
  department: string | null;
  semester: number | null;
  course_code: string | null;
}

const Recommendations = () => {
  const [session, setSession] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
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
      // Get user's reading history to find their interests
      const { data: history } = await supabase
        .from("reading_history")
        .select("book_id, books(department, genre)")
        .eq("user_id", session.user.id)
        .limit(10);

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

      // Extract departments from reading history
      const departments = history?.map((h: any) => h.books?.department).filter(Boolean) || [];
      const uniqueDepartments = [...new Set(departments)];

      let recommendedBooks: Book[] = [];

      if (uniqueDepartments.length > 0) {
        // Get books from departments user has read from
        const { data: deptBooks } = await supabase
          .from("books")
          .select("*")
          .in("department", uniqueDepartments)
          .order("rating", { ascending: false })
          .limit(12);
        
        recommendedBooks = deptBooks || [];
      }

      // If not enough books, get top-rated books from all departments
      if (recommendedBooks.length < 12) {
        const existingIds = recommendedBooks.map(b => b.id);
        const { data: topBooks } = await supabase
          .from("books")
          .select("*")
          .not("id", "in", `(${existingIds.length > 0 ? existingIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
          .order("rating", { ascending: false })
          .limit(12 - recommendedBooks.length);
        
        recommendedBooks = [...recommendedBooks, ...(topBooks || [])];
      }

      setBooks(recommendedBooks);
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
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Personalized Recommendations</h1>
        </div>

        {aiRecommendation && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {aiRecommendation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Recommended Course Materials</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground">
              Start reading books to get personalized recommendations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} onClick={() => navigate(`/book/${book.id}`)} className="cursor-pointer">
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  genre={book.genre}
                  rating={book.rating || 0}
                  publishedYear={book.published_year || undefined}
                  imageUrl={book.cover_url || undefined}
                  department={book.department || undefined}
                  semester={book.semester || undefined}
                  courseCode={book.course_code || undefined}
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
