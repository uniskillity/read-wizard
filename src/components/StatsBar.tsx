import { BookOpen, Users, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalBooks: number;
  totalDepartments: number;
  avgRating: number;
  totalSemesters: number;
}

export const StatsBar = () => {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalDepartments: 0,
    avgRating: 0,
    totalSemesters: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: books, error } = await supabase
        .from("books")
        .select("department, rating");

      if (error) throw error;

      const departments = new Set(books?.map((b) => b.department).filter(Boolean));
      const ratings = books?.map((b) => b.rating).filter((r) => r !== null && r !== undefined) as number[];
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      setStats({
        totalBooks: books?.length || 0,
        totalDepartments: departments.size,
        avgRating: avgRating,
        totalSemesters: 8,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { icon: BookOpen, label: "Total Books", value: stats.totalBooks, color: "text-primary" },
    { icon: Users, label: "Departments", value: stats.totalDepartments, color: "text-secondary" },
    { icon: TrendingUp, label: "Avg Rating", value: stats.avgRating.toFixed(1), color: "text-primary" },
    { icon: Clock, label: "Semesters", value: stats.totalSemesters, color: "text-secondary" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map(({ icon: Icon, label, value, color }, index) => (
        <div
          key={label}
          className="flex items-center gap-3 p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`p-2 rounded-full bg-muted ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
