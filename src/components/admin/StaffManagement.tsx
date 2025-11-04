import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Shield, UserMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState<'staff' | 'admin'>('staff');
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    loadStaff();
    loadMembers();
  }, []);

  const loadStaff = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles!user_roles_user_id_fkey (full_name, email)
      `)
      .in('role', ['admin', 'staff'])
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setStaff(data || []);
    }
  };

  const loadMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    setAllMembers(data || []);
  };

  const handleAddStaff = async () => {
    if (!selectedMember) {
      toast({
        title: 'Error',
        description: 'Please select a member',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: selectedMember,
          role: selectedRole
        }]);

      if (error) throw error;

      toast({ title: `${selectedRole} role assigned successfully` });
      setSelectedMember('');
      loadStaff();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({ title: 'Role removed successfully' });
      loadStaff();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only admins can manage staff roles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Staff Role</CardTitle>
          <CardDescription>Give admin or staff privileges to members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map((member: any) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAddStaff}>Assign Role</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {item.profiles?.full_name || item.profiles?.email}
              </CardTitle>
              <CardDescription>{item.profiles?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant={item.role === 'admin' ? 'default' : 'secondary'}>
                {item.role}
              </Badge>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveRole(item.id)}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove Role
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
