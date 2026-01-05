import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Book = Tables<"books">;

export const useRealtimeBooks = (initialBooks: Book[] = []) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const { toast } = useToast();

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  useEffect(() => {
    const channel = supabase
      .channel('books-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          const newBook = payload.new as Book;
          setBooks(prev => [newBook, ...prev]);
          toast({
            title: "New book added",
            description: `"${newBook.title}" is now available`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          const updatedBook = payload.new as Book;
          setBooks(prev => prev.map(book => 
            book.id === updatedBook.id ? updatedBook : book
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          const deletedBook = payload.old as Book;
          setBooks(prev => prev.filter(book => book.id !== deletedBook.id));
          toast({
            title: "Book removed",
            description: "A book has been removed from the library",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return books;
};

export const useRealtimeCategories = () => {
  const [categories, setCategories] = useState<Tables<"categories">[]>([]);

  useEffect(() => {
    // Initial load
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    loadCategories();

    // Realtime subscription
    const channel = supabase
      .channel('categories-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        () => {
          // Reload all categories on any change
          loadCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return categories;
};

export const useRealtimeReadingHistory = (userId: string | undefined) => {
  const [history, setHistory] = useState<Tables<"reading_history">[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Initial load
    const loadHistory = async () => {
      const { data } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setHistory(data);
    };
    loadHistory();

    // Realtime subscription
    const channel = supabase
      .channel(`reading-history-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reading_history',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // Reload history on any change
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return history;
};