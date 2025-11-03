import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, History, Sparkles, TrendingUp, User, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const Navigation = () => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { to: "/", label: "Home", icon: BookOpen },
    { to: "/trending", label: "Trending", icon: TrendingUp },
    { to: "/recommendations", label: "Recommendations", icon: Sparkles },
    { to: "/saved", label: "Saved", icon: Heart },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold">BookWise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Button
                key={to}
                asChild
                variant={location.pathname === to ? "default" : "ghost"}
                className="transition-all"
              >
                <Link to={to}>
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {session ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild>
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
            {navLinks.map(({ to, label, icon: Icon }) => (
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
            ))}
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
