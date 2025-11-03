import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
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
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-serif font-bold">Trending Books</h1>
          <p className="text-muted-foreground mt-2">What everyone's reading</p>
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
