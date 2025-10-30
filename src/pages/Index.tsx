import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/BookCard";
import { BookOpen, LogOut, Sparkles, TrendingUp, Search, Filter, BookMarked, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { searchBooks, getBooksByCategory, GoogleBook } from "@/lib/googleBooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroImage from "@/assets/hero-library.jpg";

const CATEGORIES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Biography",
  "History",
  "Self-Help",
  "Fantasy",
];

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const navigate = useNavigate();

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
    loadBooks();
  }, [selectedCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = selectedCategory === "All" 
        ? await searchBooks("popular books", 40)
        : await getBooksByCategory(selectedCategory, 40);
      setBooks(data);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const results = await searchBooks(searchQuery, 40);
    setBooks(results);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  const handleSaveBook = async (bookId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save books",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("reading_history").upsert({
        user_id: session.user.id,
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

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-warm flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold">BookWise</h1>
            </div>
            <div className="flex items-center gap-2">
              {session && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/saved")}>
                    <BookMarked className="mr-2 h-4 w-4" />
                    Saved
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                    <History className="mr-2 h-4 w-4" />
                    History
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for books, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Search</Button>
          </form>
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
                <Button 
                  size="lg" 
                  className="shadow-book"
                  onClick={() => session ? navigate("/recommendations") : toast({ title: "Sign in required", variant: "destructive" })}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Recommendations
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/trending")}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Explore Trending
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Library Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-serif font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === "All" ? "Popular Books" : selectedCategory}
            </h2>
            <p className="text-muted-foreground">
              {books.length} books available
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No books found</p>
              <Button onClick={() => { setSearchQuery(""); loadBooks(); }}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
              {books.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="cursor-pointer"
                >
                  <BookCard
                    id={book.id}
                    title={book.volumeInfo.title}
                    author={book.volumeInfo.authors?.join(", ") || "Unknown Author"}
                    description={book.volumeInfo.description}
                    genre={book.volumeInfo.categories?.[0] || "General"}
                    rating={book.volumeInfo.averageRating}
                    imageUrl={book.volumeInfo.imageLinks?.thumbnail}
                    onSave={handleSaveBook}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/80 backdrop-blur-sm py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-warm flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-serif font-bold">BookWise</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover your next great read with AI-powered recommendations
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/trending")} className="hover:text-primary transition-colors">Trending</button></li>
                <li><button onClick={() => navigate("/recommendations")} className="hover:text-primary transition-colors">Recommendations</button></li>
                <li><button onClick={() => navigate("/saved")} className="hover:text-primary transition-colors">Saved Books</button></li>
                <li><button onClick={() => navigate("/history")} className="hover:text-primary transition-colors">Reading History</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CATEGORIES.slice(1, 6).map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => { setSelectedCategory(cat); window.scrollTo(0, 0); }}
                      className="hover:text-primary transition-colors"
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <p className="text-sm text-muted-foreground">
                BookWise uses advanced AI to help you discover books tailored to your taste.
              </p>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p className="font-serif">
              © 2024 BookWise. Powered by Google Books API & AI recommendations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
