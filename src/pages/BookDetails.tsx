import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBookDetails, GoogleBook, searchBooks } from "@/lib/googleBooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, BookOpen, Heart, Star, Share2, Download, Trash2, FileText, Calendar, Building2, GraduationCap, Hash, Loader2, ExternalLink, ChevronRight } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-24 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book && !localBook) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Book not found</h2>
            <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/")} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Button>
          </div>
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
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-4">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground animate-fade-in">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          {localBook?.department && (
            <>
              <span>{localBook.department}</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </nav>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 animate-fade-in hover:bg-secondary/80 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-book group">
              <CardContent className="p-0 relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                {localBook?.pdf_url && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF Available
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button onClick={handleRead} className="w-full group" size="lg">
                <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                {localBook?.pdf_url ? "Read PDF" : (book?.accessInfo?.embeddable ? "Read Online" : "Read Preview")}
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSave} 
                    variant={isSaved ? "secondary" : "outline"} 
                    className="w-full group transition-all" 
                    size="lg"
                  >
                    <Heart className={`mr-2 h-5 w-5 transition-all ${isSaved ? "fill-primary text-primary scale-110" : "group-hover:scale-110"}`} />
                    {isSaved ? "Saved to Library" : "Save for Later"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSaved ? "Remove from your saved books" : "Add to your reading list"}
                </TooltipContent>
              </Tooltip>
              
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleShare} variant="outline" className="flex-1 group">
                      <Share2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Share
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share this book with others</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleDownload} variant="outline" className="flex-1 group">
                      <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                      {localBook?.pdf_url || book?.accessInfo?.pdf?.isAvailable || book?.accessInfo?.epub?.isAvailable ? "Download" : "View More"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {localBook?.pdf_url ? "Download PDF" : "View more options"}
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {(localBook?.pdf_url || book?.accessInfo?.pdf?.isAvailable || book?.accessInfo?.epub?.isAvailable) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 backdrop-blur-sm p-3 rounded-lg border border-border/50">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    Available formats: {localBook?.pdf_url ? "PDF" : (
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
                <Button onClick={handleSave} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" size="lg">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Remove from Library
                </Button>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2 text-balance leading-tight">
                {title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-4">
                by <span className="text-foreground font-medium">{author}</span>
              </p>

              {/* Quick Stats */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-sm">
                {rating && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full cursor-default">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold text-primary">{rating.toFixed(1)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Average rating</TooltipContent>
                  </Tooltip>
                )}
                {book?.volumeInfo.pageCount && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{book.volumeInfo.pageCount} pages</span>
                  </div>
                )}
                {publishedYear && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{publishedYear}</span>
                  </div>
                )}
                {book?.volumeInfo.publisher && (
                  <span className="text-muted-foreground hidden sm:inline">
                    {book.volumeInfo.publisher}
                  </span>
                )}
                {book?.volumeInfo.language && (
                  <Badge variant="outline" className="uppercase">{book.volumeInfo.language}</Badge>
                )}
              </div>

              {/* Local book specific info - Enhanced */}
              {localBook && (
                <Card className="mt-4 bg-secondary/30 border-border/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Course Information</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {localBook.department && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Department</p>
                            <p className="text-sm font-medium">{localBook.department}</p>
                          </div>
                        </div>
                      )}
                      {localBook.semester && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <GraduationCap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Semester</p>
                            <p className="text-sm font-medium">{localBook.semester}</p>
                          </div>
                        </div>
                      )}
                      {localBook.course_code && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Hash className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Course Code</p>
                            <p className="text-sm font-medium">{localBook.course_code}</p>
                          </div>
                        </div>
                      )}
                      {localBook.isbn && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">ISBN</p>
                            <p className="text-sm font-medium font-mono">{localBook.isbn}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {book?.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers.length > 0 && (
                <div className="flex gap-3 text-sm text-muted-foreground flex-wrap mt-3">
                  {book.volumeInfo.industryIdentifiers.map((identifier, idx) => (
                    <span key={idx} className="bg-secondary/50 px-2 py-1 rounded text-xs font-mono">
                      {identifier.type}: {identifier.identifier}
                    </span>
                  ))}
                </div>
              )}

              {/* User Rating Section */}
              <Card className="mt-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Rate this book</h3>
                      <p className="text-xs text-muted-foreground">Share your thoughts with others</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            className="transition-all hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-0.5"
                          >
                            <Star
                              className={`h-6 w-6 transition-colors ${
                                star <= userRating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground/40 hover:text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {userRating > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {userRating}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Genre Tags */}
            {genre && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm px-3 py-1">{genre}</Badge>
                {book?.volumeInfo.categories?.slice(1).map((category) => (
                  <Badge key={category} variant="outline" className="text-sm px-3 py-1">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    About This Book
                  </h2>
                  <div
                    className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Local recommended books */}
            {localRecommendedBooks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Related {localBook?.genre} Books
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {localBook?.department} • Semester {localBook?.semester}
                    </p>
                  </div>
                  <Link 
                    to={`/?department=${encodeURIComponent(localBook?.department || '')}&semester=${localBook?.semester}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {localRecommendedBooks.slice(0, 4).map((recBook, index) => (
                    <Link 
                      key={recBook.id} 
                      to={`/book/${recBook.id}`}
                      className="block transition-all hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
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
                        pdfUrl={recBook.pdf_url}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Google Books recommended */}
            {recommendedBooks.length > 0 && !localBook && (
              <div className="mt-8 pt-6 border-t border-border/50">
                <h2 className="text-xl sm:text-2xl font-serif font-bold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {recommendedBooks.slice(0, 4).map((recBook, index) => (
                    <Link 
                      key={recBook.id} 
                      to={`/book/${recBook.id}`}
                      className="block transition-all hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
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
                    </Link>
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
