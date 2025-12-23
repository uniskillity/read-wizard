import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Eye, EyeOff, Sparkles, ArrowRight, Library, Users, BookMarked, Mail, Lock, GraduationCap, CheckCircle2 } from "lucide-react";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const features = [
    { icon: Library, label: "10,000+ Books", desc: "Academic resources" },
    { icon: Users, label: "5,000+ Students", desc: "Active community" },
    { icon: BookMarked, label: "All Departments", desc: "Complete coverage" },
  ];

  const stats = [
    { value: "50K+", label: "Books Available" },
    { value: "15K+", label: "Active Students" },
    { value: "100+", label: "Departments" },
  ];

  const benefits = [
    "Access to all course materials",
    "Download PDFs anytime",
    "Personalized recommendations",
    "Track your reading progress",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 noise">
        {/* Animated background layers */}
        <div className="absolute inset-0">
          {/* Primary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-secondary/60" />
          
          {/* Mesh gradient effect */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/30 rounded-full blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-soft animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-glow/10 rounded-full blur-[150px] animate-pulse-soft animation-delay-400" />
          
          {/* Decorative geometric shapes */}
          <div className="absolute top-16 right-16 w-32 h-32 border-2 border-white/10 rounded-3xl rotate-12 animate-float" />
          <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-white/10 rounded-2xl -rotate-12 animate-float animation-delay-300" />
          <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-white/20 rounded-xl rotate-45 animate-spin-slow" />
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-white/5 rounded-lg rotate-12 animate-bounce-soft" />
          
          {/* Floating circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/5 rounded-full animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 border border-white/5 rounded-full animate-pulse-soft animation-delay-300" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/20 transition-transform hover:scale-105">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">MAJU Library</h2>
              <p className="text-white/50 text-xs font-medium">Digital Resources Portal</p>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-10 max-w-lg">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 animate-fade-in animation-delay-100">
                <GraduationCap className="h-4 w-4 text-white/80" />
                <span className="text-white/80 text-sm font-medium">University Library System</span>
              </div>
              
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight animate-fade-in animation-delay-200">
                Your Gateway to
                <span className="block mt-1 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Academic Excellence
                </span>
              </h1>
              
              <p className="text-white/60 text-lg leading-relaxed animate-fade-in animation-delay-300">
                Access thousands of textbooks, research papers, and course materials. 
                Everything you need for your academic journey in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 animate-fade-in animation-delay-400">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group cursor-default">
                  <div className="text-3xl font-bold text-white mb-1 transition-transform group-hover:scale-110">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-3 animate-fade-in animation-delay-500">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all cursor-default group"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{feature.label}</p>
                    <p className="text-white/50 text-xs">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-white/30 text-sm font-medium animate-fade-in">
            © 2024 Muhammad Ali Jinnah University. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10 relative bg-background overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.05),transparent_50%)]" />
        
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-32 h-32 border border-primary/5 rounded-full animate-pulse-soft" />
        <div className="absolute bottom-20 left-10 w-24 h-24 border border-secondary/5 rounded-2xl rotate-12 animate-float" />
        
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2 animate-fade-in">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">MAJU Library</span>
        </div>

        <div className="w-full max-w-[400px] relative z-10">
          {/* Header */}
          <div className="text-center mb-10 mt-16 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 shadow-sm border border-primary/10 animate-scale-up">
              <Sparkles className="h-4 w-4" />
              <span>{isLogin ? "Welcome back" : "Get started"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight animate-fade-in animation-delay-100">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="text-muted-foreground animate-fade-in animation-delay-200">
              {isLogin
                ? "Enter your credentials to continue"
                : "Start your academic journey today"}
            </p>
          </div>

          {/* Benefits list for signup */}
          {!isLogin && (
            <div className="mb-8 p-4 rounded-2xl bg-muted/50 border border-border/50 animate-fade-in animation-delay-200">
              <p className="text-sm font-medium text-foreground mb-3">What you'll get:</p>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in animation-delay-300">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@jinnah.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-2 border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-0 transition-all text-base placeholder:text-muted-foreground/60"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors underline-animated">
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
                  minLength={6}
                  className="h-12 rounded-xl border-2 border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-0 pr-12 transition-all text-base placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group mt-2 glow-primary" 
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

          {/* Divider */}
          <div className="relative my-8 animate-fade-in animation-delay-400">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">
                {isLogin ? "New to MAJU Library?" : "Already have an account?"}
              </span>
            </div>
          </div>

          {/* Toggle auth mode */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full h-12 rounded-xl font-medium text-base border-2 border-border hover:bg-muted/50 hover:border-primary/30 transition-all animate-fade-in animation-delay-500"
          >
            {isLogin ? "Create new account" : "Sign in instead"}
          </Button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-8 leading-relaxed animate-fade-in animation-delay-500">
            By continuing, you agree to MAJU University's{" "}
            <button className="text-primary hover:underline font-medium">Terms of Service</button> and{" "}
            <button className="text-primary hover:underline font-medium">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
};
