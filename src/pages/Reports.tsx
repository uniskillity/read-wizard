import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Reports = () => {
  const { isStaff, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    if (!roleLoading && !isStaff) {
      navigate('/');
    }
  }, [isStaff, roleLoading, navigate]);

  useEffect(() => {
    if (isStaff) {
      loadReports();
    }
  }, [isStaff]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Get issued books
      const { data: issued } = await supabase
        .from('book_issues')
        .select(`
          *,
          books (title, author),
          profiles!book_issues_user_id_fkey (full_name, email)
        `)
        .eq('status', 'issued')
        .order('issue_date', { ascending: false });

      // Get overdue books
      const { data: overdue } = await supabase
        .from('book_issues')
        .select(`
          *,
          books (title, author),
          profiles!book_issues_user_id_fkey (full_name, email)
        `)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });

      // Get top borrowed books
      const { data: top } = await supabase
        .from('book_issues')
        .select('book_id, books (title, author, cover_url)')
        .order('created_at', { ascending: false });

      // Count book borrows
      const bookCounts = top?.reduce((acc: any, issue: any) => {
        const bookId = issue.book_id;
        if (!acc[bookId]) {
          acc[bookId] = {
            book: issue.books,
            count: 0
          };
        }
        acc[bookId].count++;
        return acc;
      }, {});

      const topBorrowed = Object.values(bookCounts || {})
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);

      setIssuedBooks(issued || []);
      setOverdueBooks(overdue || []);
      setTopBooks(topBorrowed);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStaff) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Library Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issuedBooks.length}</div>
              <p className="text-xs text-muted-foreground">Books currently borrowed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
              <Clock className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueBooks.length}</div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Titles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topBooks.length}</div>
              <p className="text-xs text-muted-foreground">Most borrowed books</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="issued" className="w-full">
          <TabsList>
            <TabsTrigger value="issued">Issued Books</TabsTrigger>
            <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
            <TabsTrigger value="top">Top Borrowed</TabsTrigger>
          </TabsList>

          <TabsContent value="issued">
            <Card>
              <CardHeader>
                <CardTitle>Currently Issued Books</CardTitle>
                <CardDescription>Books that are currently borrowed by members</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuedBooks.map((issue: any) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">
                          {issue.books?.title || 'Unknown'}
                          <div className="text-sm text-muted-foreground">{issue.books?.author || ''}</div>
                        </TableCell>
                        <TableCell>
                          {issue.profiles?.full_name || issue.profiles?.email || 'Unknown'}
                        </TableCell>
                        <TableCell>{new Date(issue.issue_date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Books</CardTitle>
                <CardDescription>Books that have passed their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueBooks.map((issue: any) => {
                      const daysOverdue = Math.floor(
                        (new Date().getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">
                            {issue.books?.title || 'Unknown'}
                            <div className="text-sm text-muted-foreground">{issue.books?.author || ''}</div>
                          </TableCell>
                          <TableCell>
                            {issue.profiles?.full_name || issue.profiles?.email || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-destructive">
                            {new Date(issue.due_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-destructive font-bold">{daysOverdue} days</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top">
            <Card>
              <CardHeader>
                <CardTitle>Top Borrowed Books</CardTitle>
                <CardDescription>Most popular books in the library</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Times Borrowed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topBooks.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.book?.title || 'Unknown'}</TableCell>
                        <TableCell>{item.book?.author || 'Unknown'}</TableCell>
                        <TableCell className="font-bold">{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;
