import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { getBookDetails, GoogleBook } from "@/lib/googleBooks";

const SavedBooks = () => {
  const [session, setSession] = useState<any>(null);
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      loadSavedBooks();
    }
  }, [session]);

  const loadSavedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("reading_history")
        .select("book_id")
        .eq("user_id", session.user.id)
        .eq("status", "want_to_read");

      if (error) throw error;

      const bookPromises = data.map((item) => getBookDetails(item.book_id));
      const booksData = await Promise.all(bookPromises);
      setBooks(booksData.filter((b) => b !== null) as GoogleBook[]);
    } catch (error) {
      console.error("Error loading saved books:", error);
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
        <h1 className="text-4xl font-serif font-bold mb-8 animate-fade-in">Saved Books</h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading saved books...</p>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No saved books yet</p>
            <Button onClick={() => navigate("/")}>Explore Books</Button>
          </div>
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

export default SavedBooks;
