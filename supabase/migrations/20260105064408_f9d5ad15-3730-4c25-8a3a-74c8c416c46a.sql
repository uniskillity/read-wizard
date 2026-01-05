-- Enable realtime for books table
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;

-- Enable realtime for categories table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- Enable realtime for reading_history table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reading_history;