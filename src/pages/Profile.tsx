import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Settings, BarChart3, User, Loader2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [stats, setStats] = useState({
    totalBooks: 0,
    booksReading: 0,
    booksCompleted: 0,
    savedBooks: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setSession(session);
        loadUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      // Load user preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("favorite_genres")
        .eq("user_id", userId)
        .single();

      if (preferences?.favorite_genres) {
        setFavoriteGenres(preferences.favorite_genres);
      }

      // Load reading stats
      const { data: history } = await supabase
        .from("reading_history")
        .select("status")
        .eq("user_id", userId);

      if (history) {
        setStats({
          totalBooks: history.length,
          booksReading: history.filter((h) => h.status === "reading").length,
          booksCompleted: history.filter((h) => h.status === "completed").length,
          savedBooks: history.filter((h) => h.status === "want_to_read").length,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = async () => {
    if (!newGenre.trim() || !session) return;

    const updatedGenres = [...favoriteGenres, newGenre.trim()];
    setFavoriteGenres(updatedGenres);
    setNewGenre("");

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: session.user.id,
        favorite_genres: updatedGenres,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Genre added",
        description: "Your favorite genre has been saved.",
      });
    } catch (error) {
      console.error("Error saving genre:", error);
      toast({
        title: "Error",
        description: "Failed to save genre preference.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveGenre = async (genreToRemove: string) => {
    if (!session) return;

    const updatedGenres = favoriteGenres.filter((g) => g !== genreToRemove);
    setFavoriteGenres(updatedGenres);

    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: session.user.id,
        favorite_genres: updatedGenres,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Genre removed",
        description: "Your preference has been updated.",
      });
    } catch (error) {
      console.error("Error removing genre:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-4xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your reading preferences and track your progress
            </p>
          </div>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-book hover:shadow-book-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Books
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalBooks}</div>
                  </CardContent>
                </Card>
                <Card className="shadow-book hover:shadow-book-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Currently Reading
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stats.booksReading}</div>
                  </CardContent>
                </Card>
                <Card className="shadow-book hover:shadow-book-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.booksCompleted}</div>
                  </CardContent>
                </Card>
                <Card className="shadow-book hover:shadow-book-hover transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Want to Read
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{stats.savedBooks}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-book">
                <CardHeader>
                  <CardTitle>Reading Achievements</CardTitle>
                  <CardDescription>Your reading milestones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">Bookworm</p>
                        <p className="text-sm text-muted-foreground">Read 10 books</p>
                      </div>
                    </div>
                    <Badge variant={stats.booksCompleted >= 10 ? "default" : "secondary"}>
                      {stats.booksCompleted >= 10 ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card className="shadow-book">
                <CardHeader>
                  <CardTitle>Favorite Genres</CardTitle>
                  <CardDescription>
                    Add your favorite genres to get better recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {favoriteGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => handleRemoveGenre(genre)}
                      >
                        {genre} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a genre..."
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddGenre()}
                    />
                    <Button onClick={handleAddGenre}>Add</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card className="shadow-book">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={session?.user?.email || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input value={session?.user?.id || ""} disabled className="font-mono text-xs" />
                  </div>
                  <Button variant="destructive" onClick={() => supabase.auth.signOut()}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
