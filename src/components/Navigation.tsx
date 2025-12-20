import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, History, Sparkles, TrendingUp, User, Menu, X, Shield, BarChart, BookMarked, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Navigation = () => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isStaff } = useUserRole();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home", icon: BookOpen, requireAuth: false },
    { to: "/trending", label: "Trending", icon: TrendingUp, requireAuth: false },
    { to: "/recommendations", label: "For You", icon: Sparkles, requireAuth: false },
    { to: "/my-books", label: "My Books", icon: BookMarked, requireAuth: true },
    { to: "/saved", label: "Saved", icon: Heart, requireAuth: false },
    { to: "/history", label: "History", icon: History, requireAuth: false },
  ];

  const staffLinks = isStaff ? [
    { to: "/admin", label: "Admin", icon: Shield, requireAuth: false },
    { to: "/reports", label: "Reports", icon: BarChart, requireAuth: false },
  ] : [];

  const allNavLinks = [...navLinks, ...staffLinks];

  return (
    <nav className="sticky top-0 z-50 w-full border-b glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 transition-all hover:opacity-80 group">
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-hero shadow-lg group-hover:shadow-xl transition-shadow">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-hero blur-lg opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-bold">MAJU Library</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Digital Resources</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center bg-muted/50 rounded-full p-1">
            {allNavLinks.map(({ to, label, icon: Icon, requireAuth }) => {
              if (requireAuth && !session) return null;
              const isActive = location.pathname === to;
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>
                    <Link
                      to={to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive 
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className={`${isActive ? 'inline' : 'hidden lg:inline'}`}>{label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs lg:hidden">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-2">
            {session ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <div className="h-7 w-7 rounded-full bg-gradient-hero flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Profile</TooltipContent>
                </Tooltip>
                <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="rounded-full px-6">
                <Link to="/">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`} />
              <span className={`absolute block h-0.5 w-6 bg-current transition-all duration-300 top-3 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`} />
            </div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
          <div className="border-t pt-4 space-y-1">
            {allNavLinks.map(({ to, label, icon: Icon, requireAuth }, index) => {
              if (requireAuth && !session) return null;
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all animate-fade-in ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              );
            })}
            
            {session && (
              <>
                <div className="border-t my-2" />
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-all"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            )}
            
            {!session && (
              <Button asChild className="w-full mt-2">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};