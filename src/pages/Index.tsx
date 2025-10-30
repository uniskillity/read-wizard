import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/BookCard";
import { AIChat } from "@/components/AIChat";
import { BookOpen, LogOut, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-library.jpg";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  genre: string;
  rating: number;
  published_year: number | null;
}

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchBooks();
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("rating", { ascending: false })
        .limit(12);

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  const handleSaveBook = async (bookId: string) => {
    try {
      const { error } = await supabase.from("reading_history").insert({
        user_id: session?.user?.id,
        book_id: bookId,
        status: "want_to_read",
      });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Book added to your reading list",
      });
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const handleRateBook = async (bookId: string, rating: number) => {
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: session?.user?.id,
        book_id: bookId,
        feedback_type: "like",
      });

      if (error) throw error;

      toast({
        title: "Thanks for rating!",
        description: "Your feedback helps us improve recommendations",
      });
    } catch (error) {
      console.error("Error rating book:", error);
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-warm flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-serif font-bold">BookWise</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Beautiful library with warm lighting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-4 animate-fade-in">
              <h2 className="text-5xl font-serif font-bold leading-tight">
                Discover Your Next
                <span className="block text-primary mt-2">Great Read</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AI-powered recommendations tailored to your unique taste. Let us
                guide you through the world of literature.
              </p>
              <div className="flex gap-3 pt-2">
                <Button size="lg" className="shadow-book">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Recommendations
                </Button>
                <Button size="lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Explore Trending
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-serif font-bold">
              Ask Our AI Book Advisor
            </h2>
            <p className="text-muted-foreground">
              Describe what you're looking for, and we'll find the perfect match
            </p>
          </div>
          <AIChat />
        </div>
      </section>

      {/* Recommended Books Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-serif font-bold">Curated For You</h2>
            <p className="text-muted-foreground">
              Handpicked recommendations based on your reading journey
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description || undefined}
                  genre={book.genre}
                  rating={book.rating}
                  publishedYear={book.published_year || undefined}
                  onSave={handleSaveBook}
                  onRate={handleRateBook}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-serif">
            © 2024 BookWise. Helping readers discover their next favorite book.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
