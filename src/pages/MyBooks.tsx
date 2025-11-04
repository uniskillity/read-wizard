import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MyBooks = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myIssues, setMyIssues] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) {
        loadMyBooks();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadMyBooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('book_issues')
        .select(`
          *,
          books (*)
        `)
        .eq('user_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setMyIssues(data || []);
    } catch (error) {
      console.error('Error loading my books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your borrowed books',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Please Log In</h2>
          <p className="text-muted-foreground mb-8">You need to be logged in to view your borrowed books.</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const activeIssues = myIssues.filter((issue: any) => issue.status === 'issued' || issue.status === 'overdue');
  const returnedIssues = myIssues.filter((issue: any) => issue.status === 'returned');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Borrowed Books</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Currently Borrowed</h2>
          {activeIssues.length === 0 ? (
            <p className="text-muted-foreground">You don't have any books borrowed at the moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeIssues.map((issue: any) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="line-clamp-2">{issue.books?.title}</span>
                      <Badge variant={issue.status === 'overdue' ? 'destructive' : 'default'}>
                        {issue.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{issue.books?.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {issue.books?.cover_url && (
                      <img
                        src={issue.books.cover_url}
                        alt={issue.books.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Issued:</span> {new Date(issue.issue_date).toLocaleDateString()}</p>
                      <p><span className="font-semibold">Due Date:</span> {new Date(issue.due_date).toLocaleDateString()}</p>
                      {issue.status === 'overdue' && (
                        <p className="text-destructive font-semibold">
                          Overdue by {Math.floor((new Date().getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Reading History</h2>
          {returnedIssues.length === 0 ? (
            <p className="text-muted-foreground">You haven't returned any books yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {returnedIssues.map((issue: any) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{issue.books?.title}</CardTitle>
                    <CardDescription>{issue.books?.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {issue.books?.cover_url && (
                      <img
                        src={issue.books.cover_url}
                        alt={issue.books.title}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Returned: {new Date(issue.return_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MyBooks;
