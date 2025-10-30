import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { getTrendingBooks, GoogleBook } from "@/lib/googleBooks";

const Trending = () => {
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    const data = await getTrendingBooks();
    setBooks(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>

        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold">Trending Books</h1>
          <p className="text-muted-foreground ml-auto">What everyone's reading</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading trending books...</p>
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

export default Trending;
