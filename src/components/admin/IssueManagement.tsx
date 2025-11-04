import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    book_id: '',
    user_id: '',
    due_date: ''
  });

  useEffect(() => {
    loadIssues();
    loadBooksAndMembers();
  }, []);

  const loadIssues = async () => {
    const { data, error } = await supabase
      .from('book_issues')
      .select(`
        *,
        books (title, author),
        profiles!book_issues_user_id_fkey (full_name, email)
      `)
      .order('issue_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setIssues(data || []);
    }
  };

  const loadBooksAndMembers = async () => {
    const { data: booksData } = await supabase
      .from('books')
      .select('*')
      .gt('available_copies', 0)
      .order('title');

    const { data: membersData } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    setBooks(booksData || []);
    setMembers(membersData || []);
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('book_issues').insert([{
        book_id: formData.book_id,
        user_id: formData.user_id,
        issued_by: user?.id,
        due_date: formData.due_date,
        status: 'issued'
      }]);

      if (error) throw error;

      toast({ title: 'Book issued successfully' });
      setDialogOpen(false);
      resetForm();
      loadIssues();
      loadBooksAndMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReturnBook = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('book_issues')
        .update({
          status: 'returned',
          return_date: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) throw error;

      toast({ title: 'Book returned successfully' });
      loadIssues();
      loadBooksAndMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      book_id: '',
      user_id: '',
      due_date: ''
    });
  };

  const filteredIssues = issues.filter((issue: any) =>
    issue.books?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Issue Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue a Book</DialogTitle>
              <DialogDescription>
                Issue a book to a library member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="book">Book *</Label>
                <Select
                  value={formData.book_id}
                  onValueChange={(value) => setFormData({ ...formData, book_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book: any) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} - {book.available_copies} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member">Member *</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member: any) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.full_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={getDefaultDueDate()}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Issue Book</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Issues</CardTitle>
          <CardDescription>Manage book borrowing and returns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue: any) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">
                    {issue.books?.title}
                    <div className="text-sm text-muted-foreground">{issue.books?.author}</div>
                  </TableCell>
                  <TableCell>
                    {issue.profiles?.full_name || issue.profiles?.email}
                  </TableCell>
                  <TableCell>{new Date(issue.issue_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(issue.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      issue.status === 'returned' ? 'default' :
                      issue.status === 'overdue' ? 'destructive' : 'secondary'
                    }>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {issue.status !== 'returned' && (
                      <Button
                        size="sm"
                        onClick={() => handleReturnBook(issue.id)}
                      >
                        Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
