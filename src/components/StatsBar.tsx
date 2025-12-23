import { BookOpen, TrendingUp, Clock, Layers, Award } from "lucide-react";
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
  accentColor,
}: { 
  icon: any; 
  label: string; 
  value: number; 
  isDecimal?: boolean;
  delay: number;
  accentColor: 'primary' | 'secondary';
}) => {
  const animatedValue = useCountUp(isDecimal ? Math.floor(value * 10) : value, 1500);
  const displayValue = isDecimal ? (animatedValue / 10).toFixed(1) : animatedValue;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm hover:shadow-card transition-all duration-500 animate-fade-in cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
        accentColor === 'primary' 
          ? 'bg-gradient-to-br from-primary/10 via-transparent to-transparent' 
          : 'bg-gradient-to-br from-secondary/10 via-transparent to-transparent'
      }`} />
      
      {/* Glow effect */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-all duration-500 ${
        accentColor === 'primary' ? 'bg-primary' : 'bg-secondary'
      }`} />
      
      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
          accentColor === 'primary' 
            ? 'bg-primary/10 group-hover:bg-primary/20' 
            : 'bg-secondary/10 group-hover:bg-secondary/20'
        }`}>
          <Icon className={`h-6 w-6 transition-colors ${
            accentColor === 'primary' ? 'text-primary' : 'text-secondary'
          }`} />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-105">{displayValue}</p>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
        <Icon className="h-24 w-24" />
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
    { icon: BookOpen, label: "Total Books", value: stats.totalBooks, accentColor: 'primary' as const },
    { icon: Layers, label: "Departments", value: stats.totalDepartments, accentColor: 'secondary' as const },
    { icon: Award, label: "Avg Rating", value: stats.avgRating, isDecimal: true, accentColor: 'primary' as const },
    { icon: Clock, label: "Semesters", value: stats.totalSemesters, accentColor: 'secondary' as const },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
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