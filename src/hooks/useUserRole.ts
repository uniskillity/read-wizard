import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'staff' | 'user' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Prioritize admin > staff > user
          const roles = data.map(r => r.role);
          if (roles.includes('admin')) setRole('admin');
          else if (roles.includes('staff')) setRole('staff');
          else setRole('user');
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || role === 'admin';
  const isUser = role === 'user' || role === 'staff' || role === 'admin';

  return { role, isAdmin, isStaff, isUser, loading };
};
