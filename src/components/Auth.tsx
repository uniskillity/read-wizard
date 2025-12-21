import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Eye, EyeOff, Sparkles, ArrowRight, Library, Users, BookMarked } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to your personal book library.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: Library, label: "10,000+ Books", desc: "Academic resources" },
    { icon: Users, label: "5,000+ Students", desc: "Active community" },
    { icon: BookMarked, label: "All Departments", desc: "Complete coverage" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-primary">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary/80" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 border border-white/10 rounded-full animate-pulse-soft" />
          <div className="absolute bottom-40 right-20 w-96 h-96 border border-white/5 rounded-full animate-pulse-soft animation-delay-200" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white/10 rounded-3xl rotate-45 animate-pulse-soft animation-delay-300" />
          
          {/* Glowing orbs */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">MAJU Library</h2>
              <p className="text-white/60 text-xs">Digital Resources Portal</p>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Your Gateway to
                <span className="block mt-2 text-white/90">Academic Excellence</span>
              </h1>
              <p className="text-white/70 text-lg max-w-md leading-relaxed">
                Access thousands of textbooks, research papers, and course materials. 
                Everything you need for your academic journey.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{feature.label}</p>
                    <p className="text-white/60 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/40 text-sm">
            © 2024 MAJU University. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 relative bg-background">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">MAJU Library</span>
        </div>

        <div className="w-full max-w-sm relative z-10">
          {/* Header */}
          <div className="text-center mb-8 mt-12 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isLogin ? "Welcome back" : "Get started"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Enter your credentials to access your library"
                : "Start your academic journey today"}
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl font-medium text-base border-2 border-border hover:bg-muted/50 transition-all mb-6 gap-3"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@jinnah.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-0 transition-colors text-base"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-0 pr-12 transition-colors text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all group" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle auth mode */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-semibold hover:underline transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Terms */}
          <p className="text-[11px] text-muted-foreground text-center mt-8 leading-relaxed">
            By continuing, you agree to MAJU University's{" "}
            <button className="text-primary hover:underline">Terms of Service</button> and{" "}
            <button className="text-primary hover:underline">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};