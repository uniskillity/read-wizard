-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  cover_url TEXT,
  published_year INTEGER,
  isbn TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user reading history table
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('reading', 'completed', 'want_to_read', 'abandoned')) DEFAULT 'reading',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  favorite_genres TEXT[] DEFAULT '{}',
  preferred_length TEXT CHECK (preferred_length IN ('short', 'medium', 'long', 'any')) DEFAULT 'any',
  reading_pace TEXT CHECK (reading_pace IN ('slow', 'moderate', 'fast')) DEFAULT 'moderate',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create book recommendations table (stores AI-generated recommendations)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create feedback table (for learning from user behavior)
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  feedback_type TEXT CHECK (feedback_type IN ('like', 'dislike', 'save', 'skip')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Books are publicly readable
CREATE POLICY "Books are viewable by everyone" 
  ON public.books FOR SELECT 
  USING (true);

-- Only admins can insert/update/delete books (for now, allowing all authenticated users)
CREATE POLICY "Authenticated users can insert books" 
  ON public.books FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Reading history policies
CREATE POLICY "Users can view their own reading history" 
  ON public.reading_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading history" 
  ON public.reading_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history" 
  ON public.reading_history FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading history" 
  ON public.reading_history FOR DELETE 
  USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view their own recommendations" 
  ON public.recommendations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recommendations" 
  ON public.recommendations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Feedback policies
CREATE POLICY "Users can view their own feedback" 
  ON public.feedback FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_reading_history_updated_at
  BEFORE UPDATE ON public.reading_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample books
INSERT INTO public.books (title, author, description, genre, published_year, rating) VALUES
  ('To Kill a Mockingbird', 'Harper Lee', 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.', 'Classic Fiction', 1960, 4.8),
  ('1984', 'George Orwell', 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.', 'Science Fiction', 1949, 4.7),
  ('The Great Gatsby', 'F. Scott Fitzgerald', 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'Classic Fiction', 1925, 4.5),
  ('Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners that follows the character development of Elizabeth Bennet.', 'Romance', 1813, 4.6),
  ('The Hobbit', 'J.R.R. Tolkien', 'A fantasy novel and childrens book about the quest of home-loving Bilbo Baggins.', 'Fantasy', 1937, 4.7),
  ('The Catcher in the Rye', 'J.D. Salinger', 'A story about teenage rebellion and alienation narrated by Holden Caulfield.', 'Classic Fiction', 1951, 4.3),
  ('Dune', 'Frank Herbert', 'A science fiction novel set in the distant future amidst a huge interstellar empire.', 'Science Fiction', 1965, 4.6),
  ('The Lord of the Rings', 'J.R.R. Tolkien', 'An epic high-fantasy novel about the quest to destroy the One Ring.', 'Fantasy', 1954, 4.9),
  ('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', 'A young boy discovers he is a wizard on his eleventh birthday.', 'Fantasy', 1997, 4.8),
  ('The Hunger Games', 'Suzanne Collins', 'A dystopian novel set in a post-apocalyptic nation where teens fight to the death.', 'Young Adult', 2008, 4.5)
;