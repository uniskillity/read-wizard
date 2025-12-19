import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookDetails, GoogleBook, searchBooks } from "@/lib/googleBooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Heart, Star, Share2, Download, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookCard } from "@/components/BookCard";
import { Navigation } from "@/components/Navigation";

interface LocalBook {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  cover_url?: string;
  published_year?: number;
  rating?: number;
  department?: string;
  semester?: number;
  course_code?: string;
  isbn?: string;
  pdf_url?: string;
}

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [book, setBook] = useState<GoogleBook | null>(null);
  const [localBook, setLocalBook] = useState<LocalBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [savedBookId, setSavedBookId] = useState<string | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<GoogleBook[]>([]);
  const [localRecommendedBooks, setLocalRecommendedBooks] = useState<LocalBook[]>([]);
  const [showReader, setShowReader] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (id) {
      loadBook();
      checkIfSaved();
    }
  }, [id, session]);

  useEffect(() => {
    if (localBook) {
      loadLocalRecommendedBooks();
    } else if (book) {
      loadRecommendedBooks();
    }
  }, [book, localBook]);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    
    // First try to fetch from local Supabase database
    const { data: localData, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    
    if (localData) {
      setLocalBook(localData as LocalBook);
      setBook(null);
      setLoading(false);
      return;
    }
    
    // If not found locally, try Google Books API
    const data = await getBookDetails(id);
    if (data && data.volumeInfo) {
      setBook(data);
      setLocalBook(null);
    }
    setLoading(false);
  };

  const checkIfSaved = async () => {
    if (!session || !id) return;
    
    const { data, error } = await supabase
      .from("reading_history")
      .select("id, rating")
      .eq("user_id", session.user.id)
      .eq("book_id", id)
      .maybeSingle();

    if (data) {
      setIsSaved(true);
      setSavedBookId(data.id);
      setUserRating(data.rating || 0);
    }
  };

  const loadRecommendedBooks = async () => {
    if (!book) return;
    const category = book.volumeInfo.categories?.[0] || "fiction";
    const books = await searchBooks(category, 8);
    setRecommendedBooks(books.filter(b => b.id !== id));
  };

  const loadLocalRecommendedBooks = async () => {
    if (!localBook) return;
    
    // First, try to get books from same department AND same semester
    const { data: sameSemesterBooks } = await supabase
      .from("books")
      .select("*")
      .eq("department", localBook.department)
      .eq("semester", localBook.semester)
      .neq("id", id)
      .limit(8);
    
    if (sameSemesterBooks && sameSemesterBooks.length >= 4) {
      // Sort by genre similarity - prioritize same genre first
      const sortedBooks = (sameSemesterBooks as LocalBook[]).sort((a, b) => {
        const aGenreMatch = a.genre?.toLowerCase() === localBook.genre?.toLowerCase() ? 1 : 0;
        const bGenreMatch = b.genre?.toLowerCase() === localBook.genre?.toLowerCase() ? 1 : 0;
        return bGenreMatch - aGenreMatch;
      });
      setLocalRecommendedBooks(sortedBooks);
      return;
    }
    
    // If not enough books in same semester, also include books from same department
    const { data: sameDeptBooks } = await supabase
      .from("books")
      .select("*")
      .eq("department", localBook.department)
      .neq("id", id)
      .limit(8);
    
    if (sameDeptBooks) {
      // Sort: same semester first, then by genre match
      const sortedBooks = (sameDeptBooks as LocalBook[]).sort((a, b) => {
        const aSemesterMatch = a.semester === localBook.semester ? 2 : 0;
        const bSemesterMatch = b.semester === localBook.semester ? 2 : 0;
        const aGenreMatch = a.genre?.toLowerCase() === localBook.genre?.toLowerCase() ? 1 : 0;
        const bGenreMatch = b.genre?.toLowerCase() === localBook.genre?.toLowerCase() ? 1 : 0;
        return (bSemesterMatch + bGenreMatch) - (aSemesterMatch + aGenreMatch);
      });
      setLocalRecommendedBooks(sortedBooks);
    }
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
      if (isSaved && savedBookId) {
        const { error } = await supabase
          .from("reading_history")
          .delete()
          .eq("id", savedBookId);

        if (error) throw error;

        setIsSaved(false);
        setSavedBookId(null);
        setUserRating(0);
        toast({
          title: "Removed from saved",
          description: "Book removed from your list",
        });
      } else {
        const { data, error } = await supabase
          .from("reading_history")
          .insert({
            user_id: session.user.id,
            book_id: id,
            status: "want_to_read",
            rating: userRating || null,
          })
          .select()
          .single();

        if (error) throw error;

        setIsSaved(true);
        setSavedBookId(data.id);
        toast({
          title: "Saved!",
          description: "Book saved for later",
        });
      }
    } catch (error) {
      console.error("Error saving book:", error);
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive",
      });
    }
  };

  const handleRating = async (rating: number) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to rate books",
        variant: "destructive",
      });
      return;
    }

    setUserRating(rating);

    if (savedBookId) {
      try {
        const { error } = await supabase
          .from("reading_history")
          .update({ rating })
          .eq("id", savedBookId);

        if (error) throw error;

        toast({
          title: "Rating updated",
          description: `You rated this book ${rating} stars`,
        });
      } catch (error) {
        console.error("Error updating rating:", error);
      }
    }
  };

  const handleRead = async () => {
    if (localBook?.pdf_url) {
      window.open(localBook.pdf_url, "_blank");
      return;
    }
    
    if (book?.accessInfo?.embeddable || book?.accessInfo?.webReaderLink) {
      setShowReader(true);
      
      if (session && !isSaved) {
        try {
          const { data, error } = await supabase
            .from("reading_history")
            .insert({
              user_id: session.user.id,
              book_id: id,
              status: "reading",
              started_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!error) {
            setIsSaved(true);
            setSavedBookId(data.id);
          }
        } catch (error) {
          console.error("Error tracking reading:", error);
        }
      }
    } else if (book?.volumeInfo.previewLink) {
      window.open(book.volumeInfo.previewLink, "_blank");
    }
  };

  const handleShare = async () => {
    const title = localBook?.title || book?.volumeInfo.title;
    const author = localBook?.author || book?.volumeInfo.authors?.join(", ");
    
    if (navigator.share && title) {
      try {
        await navigator.share({
          title: title,
          text: `Check out "${title}" by ${author}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Book link copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (localBook?.pdf_url) {
      window.open(localBook.pdf_url, "_blank");
      toast({
        title: "Opening PDF",
        description: "The PDF version is now opening",
      });
      return;
    }
    
    if (book?.accessInfo?.pdf?.isAvailable && book?.accessInfo?.pdf?.downloadLink) {
      window.open(book.accessInfo.pdf.downloadLink, "_blank");
      toast({
        title: "Opening PDF",
        description: "The PDF version is now opening",
      });
    } else if (book?.accessInfo?.epub?.isAvailable && book?.accessInfo?.epub?.downloadLink) {
      window.open(book.accessInfo.epub.downloadLink, "_blank");
      toast({
        title: "Opening EPUB",
        description: "The EPUB version is now opening",
      });
    } else if (book?.volumeInfo.infoLink) {
      window.open(book.volumeInfo.infoLink, "_blank");
      toast({
        title: "Opening book info",
        description: "View more details and purchase options",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <p className="text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (!book && !localBook) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Book not found</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Get display values from either local or Google book
  const title = localBook?.title || book?.volumeInfo.title || "Unknown Title";
  const author = localBook?.author || book?.volumeInfo.authors?.join(", ") || "Unknown Author";
  const description = localBook?.description || book?.volumeInfo.description;
  const imageUrl = localBook?.cover_url || book?.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || "/placeholder.svg";
  const genre = localBook?.genre || book?.volumeInfo.categories?.[0];
  const rating = localBook?.rating || book?.volumeInfo.averageRating;
  const publishedYear = localBook?.published_year || (book?.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-book">
              <CardContent className="p-0">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button onClick={handleRead} className="w-full" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                {localBook?.pdf_url ? "Read PDF" : (book?.accessInfo?.embeddable ? "Read Online" : "Read Preview")}
              </Button>
              <Button onClick={handleSave} variant="outline" className="w-full" size="lg">
                <Heart className={`mr-2 h-5 w-5 ${isSaved ? "fill-primary" : ""}`} />
                {isSaved ? "Saved" : "Save for Later"}
              </Button>
              <div className="flex gap-3">
                <Button onClick={handleShare} variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  {localBook?.pdf_url || book?.accessInfo?.pdf?.isAvailable || book?.accessInfo?.epub?.isAvailable ? "Download" : "View More"}
                </Button>
              </div>
              {(localBook?.pdf_url || book?.accessInfo?.pdf?.isAvailable || book?.accessInfo?.epub?.isAvailable) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary p-2 rounded">
                  <FileText className="h-4 w-4" />
                  <span>
                    Available: {localBook?.pdf_url ? "PDF" : (
                      <>
                        {book?.accessInfo?.pdf?.isAvailable && "PDF"} 
                        {book?.accessInfo?.pdf?.isAvailable && book?.accessInfo?.epub?.isAvailable && " & "}
                        {book?.accessInfo?.epub?.isAvailable && "EPUB"}
                      </>
                    )}
                  </span>
                </div>
              )}
              {isSaved && (
                <Button onClick={handleSave} variant="destructive" className="w-full" size="lg">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Remove from Library
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">
                {title}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                by {author}
              </p>

              <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-sm sm:text-base">
                {rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-primary text-primary" />
                    <span className="font-medium">{rating}</span>
                    <span className="text-xs text-muted-foreground">(avg)</span>
                  </div>
                )}
                {book?.volumeInfo.pageCount && (
                  <span className="text-muted-foreground">
                    {book.volumeInfo.pageCount} pages
                  </span>
                )}
                {publishedYear && (
                  <span className="text-muted-foreground">
                    Published: {publishedYear}
                  </span>
                )}
                {book?.volumeInfo.publisher && (
                  <span className="text-muted-foreground">
                    {book.volumeInfo.publisher}
                  </span>
                )}
                {book?.volumeInfo.language && (
                  <Badge variant="outline">{book.volumeInfo.language.toUpperCase()}</Badge>
                )}
              </div>

              {/* Local book specific info */}
              {localBook && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {localBook.department && (
                    <Badge variant="secondary">{localBook.department}</Badge>
                  )}
                  {localBook.semester && (
                    <Badge variant="outline">Semester {localBook.semester}</Badge>
                  )}
                  {localBook.course_code && (
                    <Badge variant="outline">{localBook.course_code}</Badge>
                  )}
                  {localBook.isbn && (
                    <span className="text-sm text-muted-foreground">ISBN: {localBook.isbn}</span>
                  )}
                </div>
              )}

              {book?.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers.length > 0 && (
                <div className="flex gap-2 text-sm text-muted-foreground flex-wrap mt-2">
                  {book.volumeInfo.industryIdentifiers.map((identifier, idx) => (
                    <span key={idx}>{identifier.type}: {identifier.identifier}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm font-medium">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          star <= userRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {userRating} star{userRating !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {genre && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{genre}</Badge>
                {book?.volumeInfo.categories?.slice(1).map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-serif font-bold mb-4">About This Book</h2>
                  <div
                    className="text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Local recommended books */}
            {localRecommendedBooks.length > 0 && (
              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">
                  Related {localBook?.genre} Books
                  {localBook?.semester && (
                    <span className="text-base font-normal text-muted-foreground ml-2">
                      (Semester {localBook.semester})
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  More books from {localBook?.department} department
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {localRecommendedBooks.slice(0, 4).map((recBook) => (
                    <div 
                      key={recBook.id} 
                      onClick={() => navigate(`/book/${recBook.id}`)}
                      className="cursor-pointer"
                    >
                      <BookCard
                        id={recBook.id}
                        title={recBook.title}
                        author={recBook.author}
                        description={recBook.description}
                        genre={recBook.genre}
                        rating={recBook.rating || 0}
                        publishedYear={recBook.published_year}
                        imageUrl={recBook.cover_url}
                        department={recBook.department}
                        semester={recBook.semester}
                        courseCode={recBook.course_code}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Books recommended */}
            {recommendedBooks.length > 0 && !localBook && (
              <div>
                <h2 className="text-2xl font-serif font-bold mb-4">Recommended Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedBooks.slice(0, 4).map((recBook) => (
                    <div 
                      key={recBook.id} 
                      onClick={() => navigate(`/book/${recBook.id}`)}
                      className="cursor-pointer"
                    >
                      <BookCard
                        id={recBook.id}
                        title={recBook.volumeInfo.title}
                        author={recBook.volumeInfo.authors?.join(", ") || "Unknown Author"}
                        description={recBook.volumeInfo.description}
                        genre={recBook.volumeInfo.categories?.[0] || "General"}
                        rating={recBook.volumeInfo.averageRating || 0}
                        publishedYear={
                          recBook.volumeInfo.publishedDate
                            ? new Date(recBook.volumeInfo.publishedDate).getFullYear()
                            : undefined
                        }
                        imageUrl={recBook.volumeInfo.imageLinks?.thumbnail}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Book Reader Dialog */}
      {book && (
        <Dialog open={showReader} onOpenChange={setShowReader}>
          <DialogContent className="max-w-5xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full">
              {book.accessInfo?.webReaderLink ? (
                <iframe
                  src={book.accessInfo.webReaderLink}
                  className="w-full h-full rounded border"
                  title="Book Reader"
                />
              ) : (
                <iframe
                  src={`https://books.google.com/books?id=${id}&lpg=PP1&pg=PP1&output=embed`}
                  className="w-full h-full rounded border"
                  title="Book Reader"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BookDetails;
