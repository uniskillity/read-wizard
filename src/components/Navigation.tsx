import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, History, Sparkles, TrendingUp, User, Menu, X, Shield, BarChart, BookMarked, LogOut } from "lucide-react";
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
    { to: "/recommendations", label: "Recommendations", icon: Sparkles, requireAuth: false },
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
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-all hover:scale-105 hover:opacity-80">
            <div className="p-1.5 rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg font-bold hidden sm:inline">MAJU BR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {allNavLinks.map(({ to, label, icon: Icon, requireAuth }) => {
              if (requireAuth && !session) return null;
              const isActive = location.pathname === to;
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`transition-all h-9 w-9 p-0 ${isActive ? "shadow-sm" : "hover:bg-muted"}`}
                    >
                      <Link to={to}>
                        <Icon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {session ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Link to="/profile">
                        <User className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Profile</TooltipContent>
                </Tooltip>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="h-9 gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="h-9">
                <Link to="/">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2 animate-in slide-in-from-top">
            {allNavLinks.map(({ to, label, icon: Icon, requireAuth }) => {
              if (requireAuth && !session) return null;
              return (
                <Button
                  key={to}
                  asChild
                  variant={location.pathname === to ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to={to}>
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Link>
                </Button>
              );
            })}
            {session ? (
              <>
                <Button asChild variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                <Link to="/">Sign In</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
