import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetails, GoogleBook } from "@/lib/googleBooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Heart, Star, Share2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<GoogleBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getBookDetails(id);
    setBook(data);
    setLoading(false);
  };

  const handleSave = async () => {
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
        book_id: id,
        status: "want_to_read",
      });

      if (error) throw error;

      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Removed from saved" : "Saved!",
        description: isSaved ? "Book removed from your list" : "Book saved for later",
      });
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const handleRead = () => {
    if (book?.volumeInfo.previewLink) {
      window.open(book.volumeInfo.previewLink, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Book not found</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

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

        <div className="grid md:grid-cols-3 gap-8 animate-slide-up">
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-book">
              <CardContent className="p-0">
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || "/placeholder.svg"}
                  alt={book.volumeInfo.title}
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button onClick={handleRead} className="w-full" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                Read Preview
              </Button>
              <Button onClick={handleSave} variant="outline" className="w-full" size="lg">
                <Heart className={`mr-2 h-5 w-5 ${isSaved ? "fill-primary" : ""}`} />
                {isSaved ? "Saved" : "Save for Later"}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">
                {book.volumeInfo.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                by {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                {book.volumeInfo.averageRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="font-medium">{book.volumeInfo.averageRating}</span>
                  </div>
                )}
                {book.volumeInfo.pageCount && (
                  <span className="text-muted-foreground">
                    {book.volumeInfo.pageCount} pages
                  </span>
                )}
                {book.volumeInfo.publishedDate && (
                  <span className="text-muted-foreground">
                    Published: {book.volumeInfo.publishedDate}
                  </span>
                )}
              </div>
            </div>

            {book.volumeInfo.categories && (
              <div className="flex gap-2 flex-wrap">
                {book.volumeInfo.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {book.volumeInfo.description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-serif font-bold mb-4">About This Book</h2>
                  <div
                    className="text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: book.volumeInfo.description }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
