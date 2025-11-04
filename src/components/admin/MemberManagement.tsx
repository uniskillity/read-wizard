import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .order('member_since', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const filteredMembers = members.filter((member: any) =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member: any) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {member.full_name || member.email}
              </CardTitle>
              <CardDescription>{member.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {member.phone && (
                <p className="text-sm"><span className="font-semibold">Phone:</span> {member.phone}</p>
              )}
              {member.address && (
                <p className="text-sm"><span className="font-semibold">Address:</span> {member.address}</p>
              )}
              <p className="text-sm">
                <span className="font-semibold">Member since:</span>{' '}
                {new Date(member.member_since).toLocaleDateString()}
              </p>
              <div className="flex gap-1">
                {member.user_roles?.map((ur: any, index: number) => (
                  <Badge key={index} variant="outline">
                    {ur.role}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
