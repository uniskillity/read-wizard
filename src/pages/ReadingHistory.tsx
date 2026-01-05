import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { Tables } from "@/integrations/supabase/types";
import { BookOpen, Clock } from "lucide-react";

type Book = Tables<"books">;

interface ReadingHistoryItem {
  id: string;
  book_id: string;
  status: string | null;
  rating: number | null;
  created_at: string | null;
  book: Book | null;
}

const ReadingHistory = () => {
  const [session, setSession] = useState<any>(null);
  const [historyItems, setHistoryItems] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    try {
      // Fetch reading history with book details from local database
      const { data, error } = await supabase
        .from("reading_history")
        .select(`
          id,
          book_id,
          status,
          rating,
          created_at,
          books (*)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const items: ReadingHistoryItem[] = (data || []).map((item: any) => ({
        id: item.id,
        book_id: item.book_id,
        status: item.status,
        rating: item.rating,
        created_at: item.created_at,
        book: item.books
      }));

      setHistoryItems(items.filter(item => item.book !== null));
    } catch (error) {
      console.error("Error loading history:", error);
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
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold">Reading History</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">No reading history yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring and save books to build your reading history</p>
            <Button onClick={() => navigate("/")}>Start Exploring</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/book/${item.book_id}`)} 
                className="cursor-pointer"
              >
                <BookCard
                  id={item.book_id}
                  title={item.book!.title}
                  author={item.book!.author}
                  description={item.book!.description}
                  genre={item.book!.genre}
                  rating={item.rating || item.book!.rating || 0}
                  publishedYear={item.book!.published_year || undefined}
                  imageUrl={item.book!.cover_url || undefined}
                  department={item.book!.department || undefined}
                  semester={item.book!.semester || undefined}
                  courseCode={item.book!.course_code || undefined}
                  pdfUrl={item.book!.pdf_url || undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingHistory;