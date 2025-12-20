import { BookOpen, Users, TrendingUp, Clock, Layers } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalBooks: number;
  totalDepartments: number;
  avgRating: number;
  totalSemesters: number;
}

// Animated counter hook
const useCountUp = (end: number, duration: number = 1500, start: number = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = Math.floor(easeOutQuart * (end - start) + start);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  isDecimal, 
  delay, 
  gradient 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  isDecimal?: boolean;
  delay: number;
  gradient: string;
}) => {
  const animatedValue = useCountUp(isDecimal ? Math.floor(value * 10) : value, 1500);
  const displayValue = isDecimal ? (animatedValue / 10).toFixed(1) : animatedValue;

  return (
    <div
      className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm hover:shadow-card transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      
      <div className="relative flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted group-hover:bg-background/50 transition-colors">
          <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{displayValue}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-20 w-20" />
      </div>
    </div>
  );
};

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
    { icon: BookOpen, label: "Total Books", value: stats.totalBooks, gradient: "bg-gradient-to-br from-primary/10 to-transparent" },
    { icon: Layers, label: "Departments", value: stats.totalDepartments, gradient: "bg-gradient-to-br from-secondary/10 to-transparent" },
    { icon: TrendingUp, label: "Avg Rating", value: stats.avgRating, isDecimal: true, gradient: "bg-gradient-to-br from-primary/10 to-transparent" },
    { icon: Clock, label: "Semesters", value: stats.totalSemesters, gradient: "bg-gradient-to-br from-secondary/10 to-transparent" },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <StatCard key={item.label} {...item} delay={index * 100} />
      ))}
    </div>
  );
};