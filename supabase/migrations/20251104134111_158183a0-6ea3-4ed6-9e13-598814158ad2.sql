-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'staff')
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins and staff can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

-- Add inventory and category columns to books
ALTER TABLE public.books 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS total_copies INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS available_copies INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update books RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;

CREATE POLICY "Admins and staff can insert books"
  ON public.books FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can update books"
  ON public.books FOR UPDATE
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can delete books"
  ON public.books FOR DELETE
  USING (public.is_admin_or_staff(auth.uid()));

-- Create book_issues table (borrowing/lending)
CREATE TABLE public.book_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  issued_by UUID NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own issues"
  ON public.book_issues FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins and staff can manage issues"
  ON public.book_issues FOR ALL
  USING (public.is_admin_or_staff(auth.uid()));

-- Create profiles table for additional user info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update available_copies when books are issued/returned
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease available copies when book is issued
    UPDATE public.books
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id AND available_copies > 0;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No copies available for this book';
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned' THEN
    -- Increase available copies when book is returned
    UPDATE public.books
    SET available_copies = available_copies + 1
    WHERE id = NEW.book_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER manage_book_availability
  AFTER INSERT OR UPDATE ON public.book_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_book_availability();

-- Trigger to automatically mark overdue books
CREATE OR REPLACE FUNCTION public.mark_overdue_books()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'issued' AND NEW.due_date < now() THEN
    NEW.status = 'overdue';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_overdue_status
  BEFORE UPDATE ON public.book_issues
  FOR EACH ROW EXECUTE FUNCTION public.mark_overdue_books();

-- Update existing tables with missing policies
CREATE POLICY "Admins and staff can update recommendations"
  ON public.recommendations FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can delete their recommendations"
  ON public.recommendations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and staff can update feedback"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Users can delete their feedback"
  ON public.feedback FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_book_issues_user_id ON public.book_issues(user_id);
CREATE INDEX idx_book_issues_book_id ON public.book_issues(book_id);
CREATE INDEX idx_book_issues_status ON public.book_issues(status);
CREATE INDEX idx_book_issues_due_date ON public.book_issues(due_date);
CREATE INDEX idx_books_category_id ON public.books(category_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Trigger for updated_at timestamps
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_issues_updated_at
  BEFORE UPDATE ON public.book_issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();