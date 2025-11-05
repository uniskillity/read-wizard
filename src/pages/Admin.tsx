import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from '@/components/Navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { BookManagement } from '@/components/admin/BookManagement';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { MemberManagement } from '@/components/admin/MemberManagement';
import { StaffManagement } from '@/components/admin/StaffManagement';
import { IssueManagement } from '@/components/admin/IssueManagement';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const { isStaff, isAdmin, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isStaff) {
      navigate('/');
    }
  }, [isStaff, loading, navigate]);

  if (loading) {
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
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="books" className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            {isAdmin && <TabsTrigger value="members">Members</TabsTrigger>}
            {isAdmin && <TabsTrigger value="staff">Staff</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="books">
            <BookManagement />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>
          
          <TabsContent value="issues">
            <IssueManagement />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="members">
              <MemberManagement />
            </TabsContent>
          )}
          
          {isAdmin && (
            <TabsContent value="staff">
              <StaffManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
