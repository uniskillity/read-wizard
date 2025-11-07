import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@/components/Auth";
import { Navigation } from "@/components/Navigation";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, GraduationCap, Library, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-maju.jpg";
import { Link } from "react-router-dom";

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      loadBooks();
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    try {
      let query = supabase
        .from("books")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%`);
      
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
      
      {/* Search Header */}
      {!isSearching && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for textbooks, course materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full sm:w-auto">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Hero Section */}
      {!isSearching && (
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <img 
          src={heroImage} 
          alt="MAJU Library" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <GraduationCap className="h-16 w-16 mb-4" />
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4">
            MAJU University Library
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-2 max-w-3xl">
            Mohammad Ali Jinnah University Digital Library
          </p>
          <p className="text-sm sm:text-base lg:text-lg mb-8 max-w-2xl opacity-90">
            Access textbooks, course materials, and academic resources for all semesters and departments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/my-books">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Library className="mr-2 h-5 w-5" />
                My Books
              </Button>
            </Link>
            <Link to="/trending">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse
              </Button>
            </Link>
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Course Materials
          </h2>
          <p className="text-muted-foreground">
            {selectedDepartment !== "All Departments" && selectedSemester !== "All Semesters" 
              ? `${selectedDepartment} - Semester ${selectedSemester}` 
              : selectedDepartment !== "All Departments" 
              ? selectedDepartment 
              : selectedSemester !== "All Semesters"
              ? `Semester ${selectedSemester}`
              : "Browse course textbooks and materials"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books available</h3>
            <p className="text-muted-foreground">
              {selectedDepartment !== "All Departments" || selectedSemester !== "All Semesters"
                ? "No books found for the selected filters"
                : "No books have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`}>
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
                <GraduationCap className="h-5 w-5" />
                MAJU BR
              </h3>
              <p className="text-sm opacity-90">
                Mohammad Ali Jinnah University Books Recommendation - Your digital library for course materials and academic resources.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/trending" className="hover:underline opacity-90">Browse Catalog</Link></li>
                <li><Link to="/my-books" className="hover:underline opacity-90">My Books</Link></li>
                <li><Link to="/saved" className="hover:underline opacity-90">Saved Books</Link></li>
                <li><Link to="/history" className="hover:underline opacity-90">Reading History</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Faculties</h4>
              <ul className="space-y-2 text-sm">
                <li className="opacity-90">Faculty of Computing</li>
                <li className="opacity-90">Faculty of Business</li>
                <li className="opacity-90">Faculty of Life Sciences</li>
                <li className="opacity-90">Faculty of Engineering</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://jinnah.edu" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90">University Website</a></li>
                <li><Link to="/profile" className="hover:underline opacity-90">My Profile</Link></li>
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
