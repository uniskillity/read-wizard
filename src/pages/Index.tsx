import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, GraduationCap, Library, FileText, X, Loader2, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-maju.jpg";
import { Link } from "react-router-dom";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { StatsBar } from "@/components/StatsBar";
import { Badge } from "@/components/ui/badge";

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
  pdf_url: string | null;
}

const DEPARTMENTS = [
  "All Departments",
  "BS Computer Science",
  "BS Software Engineering", 
  "BS Artificial Intelligence",
  "BBA",
  "BS FinTech",
  "BS Business Computing",
  "BS Accounting & Finance",
  "BS Biotechnology",
  "BS Psychology"
];

const SEMESTERS = ["All Semesters", "1", "2", "3", "4", "5", "6", "7", "8"];

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [isSearching, setIsSearching] = useState(false);
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
    loadBooks();
  }, [selectedDepartment, selectedSemester]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setIsSearching(false);
        loadBooks();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      let query = supabase.from("books").select("*");
      
      if (selectedDepartment !== "All Departments") {
        query = query.eq("department", selectedDepartment);
      }
      
      if (selectedSemester !== "All Semesters") {
        query = query.eq("semester", parseInt(selectedSemester));
      }
      
      const { data, error } = await query.order("title");
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading books",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    setLoading(true);
    try {
      let query = supabase
        .from("books")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
      
      if (selectedDepartment !== "All Departments") {
        query = query.eq("department", selectedDepartment);
      }
      
      if (selectedSemester !== "All Semesters") {
        query = query.eq("semester", parseInt(selectedSemester));
      }
      
      const { data, error } = await query.order("title");
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to save books",
      });
      return;
    }

    try {
      const { error } = await supabase.from("reading_history").insert({
        user_id: session.user.id,
        book_id: bookId,
        status: "want_to_read",
      });

      if (error) throw error;

      toast({
        title: "Book saved!",
        description: "Added to your reading list",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save book. Please try again.",
      });
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      {!isSearching && (
        <div className="relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="MAJU Library" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-secondary/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          
          {/* Hero Content */}
          <div className="relative container mx-auto px-4 py-16 sm:py-24 lg:py-32">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span>Digital Library Portal</span>
              </div>
              
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in animation-delay-100">
                MAJU University
                <span className="block text-white/90 mt-2">Digital Library</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl animate-fade-in animation-delay-200">
                Access textbooks, course materials, and academic resources for all semesters and departments. Your gateway to knowledge.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-300">
                <Link to="/my-books">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-lg">
                    <Library className="mr-2 h-5 w-5" />
                    My Library
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/trending">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Trending Books
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Search Section */}
      <div className={`sticky ${isSearching ? 'top-16' : 'top-16'} z-30 glass border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              {loading && searchQuery ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              )}
              <Input
                type="search"
                placeholder="Search books, authors, course codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-12 text-base rounded-xl border-2 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-[140px] h-12 rounded-xl bg-background">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem === "All Semesters" ? sem : `Semester ${sem}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active filters */}
          {(selectedDepartment !== "All Departments" || selectedSemester !== "All Semesters" || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 pl-2">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedDepartment !== "All Departments" && (
                <Badge variant="outline" className="gap-1 pl-2">
                  {selectedDepartment}
                  <button onClick={() => setSelectedDepartment("All Departments")} className="ml-1 hover:text-destructive rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedSemester !== "All Semesters" && (
                <Badge variant="outline" className="gap-1 pl-2">
                  Semester {selectedSemester}
                  <button onClick={() => setSelectedSemester("All Semesters")} className="ml-1 hover:text-destructive rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All Departments");
                  setSelectedSemester("All Semesters");
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        {!isSearching && (
          <div className="mb-10">
            <StatsBar />
          </div>
        )}

        {/* Section Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                {isSearching ? "Search Results" : "Course Materials"}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {isSearching 
                  ? `Found ${books.length} book${books.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : selectedDepartment !== "All Departments" && selectedSemester !== "All Semesters" 
                    ? `${selectedDepartment} - Semester ${selectedSemester}` 
                    : selectedDepartment !== "All Departments" 
                      ? selectedDepartment 
                      : selectedSemester !== "All Semesters"
                        ? `Semester ${selectedSemester}`
                        : `${books.length} books available`}
              </p>
            </div>
            {!isSearching && (
              <Link to="/trending">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-muted mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No books found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No books match "${searchQuery}". Try different keywords or clear filters.`
                : selectedDepartment !== "All Departments" || selectedSemester !== "All Semesters"
                  ? "No books found for the selected filters. Try adjusting your selection."
                  : "No books have been added to the library yet."}
            </p>
            {(searchQuery || selectedDepartment !== "All Departments" || selectedSemester !== "All Semesters") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("All Departments");
                  setSelectedSemester("All Semesters");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              >
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  genre={book.genre}
                  rating={book.rating || 0}
                  publishedYear={book.published_year || undefined}
                  imageUrl={book.cover_url}
                  department={book.department || undefined}
                  semester={book.semester || undefined}
                  courseCode={book.course_code || undefined}
                  pdfUrl={book.pdf_url || undefined}
                  onSave={handleSaveBook}
                />
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white/10">
                  <GraduationCap className="h-5 w-5" />
                </div>
                MAJU Library
              </h3>
              <p className="text-sm opacity-90">
                Mohammad Ali Jinnah University Books Recommendation - Your digital library for course materials and academic resources.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/trending" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">Browse Catalog</Link></li>
                <li><Link to="/my-books" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">My Books</Link></li>
                <li><Link to="/saved" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">Saved Books</Link></li>
                <li><Link to="/history" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">Reading History</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Faculties</h4>
              <ul className="space-y-2 text-sm">
                <li className="opacity-90">Faculty of Computing</li>
                <li className="opacity-90">Faculty of Business</li>
                <li className="opacity-90">Faculty of Life Sciences</li>
                <li className="opacity-90">Faculty of Engineering</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://jinnah.edu" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">University Website</a></li>
                <li><Link to="/profile" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">My Profile</Link></li>
                <li className="opacity-90">Help & FAQ</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 pt-6 text-center text-sm opacity-75">
            <p>&copy; {new Date().getFullYear()} Mohammad Ali Jinnah University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;