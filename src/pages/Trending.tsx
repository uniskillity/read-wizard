import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, GraduationCap, Flame } from "lucide-react";

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
  pdf_url?: string;
}

const Trending = () => {
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    loadTrending();
  }, [selectedDepartment]);

  const loadTrending = async () => {
    setLoading(true);
    
    let query = supabase
      .from("books")
      .select("*")
      .order("rating", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (selectedDepartment) {
      query = query.eq("department", selectedDepartment);
    }
    
    const { data, error } = await query;
    
    if (data) {
      setBooks(data as LocalBook[]);
      
      // Extract unique departments for filter
      if (!selectedDepartment) {
        const uniqueDepts = [...new Set(data.map(b => b.department).filter(Boolean))] as string[];
        setDepartments(uniqueDepts);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Trending Books</h1>
          </div>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Popular books from university curriculum
          </p>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <p className="text-sm font-medium mb-3 text-muted-foreground">Filter by Department</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedDepartment === null ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1"
                onClick={() => setSelectedDepartment(null)}
              >
                All Departments
              </Badge>
              {departments.map((dept) => (
                <Badge
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">No trending books yet</h2>
            <p className="text-muted-foreground">
              {selectedDepartment 
                ? `No books found in ${selectedDepartment} department.`
                : "Check back soon for popular curriculum books."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up">
            {books.map((book, index) => (
              <Link 
                key={book.id} 
                to={`/book/${book.id}`} 
                className="block transition-all hover:-translate-y-1 relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Trending badge for top 3 */}
                {index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
                      <Flame className="h-3 w-3 mr-1" />
                      #{index + 1}
                    </Badge>
                  </div>
                )}
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  description={book.description}
                  genre={book.genre}
                  rating={book.rating || 0}
                  publishedYear={book.published_year}
                  imageUrl={book.cover_url}
                  department={book.department}
                  semester={book.semester}
                  courseCode={book.course_code}
                  pdfUrl={book.pdf_url}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
