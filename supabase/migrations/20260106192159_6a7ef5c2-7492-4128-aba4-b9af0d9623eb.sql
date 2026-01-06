-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- 2. PROFILES (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm INTEGER,
  weight_goal_kg DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER_ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. CUSTOMERS (Extended client info)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_admin_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('active', 'inactive', 'on_hold', 'completed')) DEFAULT 'active',
  subscription_type TEXT,
  subscription_start_date DATE,
  subscription_end_date DATE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MEAL_PLANS
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_calories INTEGER,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MEAL_PLAN_ITEMS
CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_name TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_automated BOOLEAN DEFAULT FALSE,
  trigger_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id),
  booking_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. HABITS
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  target_frequency INTEGER DEFAULT 7,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. HABIT_LOGS
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  logged_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. CHECK_INS
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 5),
  sleep_hours DECIMAL(3,1),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  hunger_level INTEGER CHECK (hunger_level BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. FOOD_LOGS
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories INTEGER,
  protein_g DECIMAL(5,1),
  carbs_g DECIMAL(5,1),
  fat_g DECIMAL(5,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. WATER_LOGS
CREATE TABLE public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. ANALYTICS_EVENTS
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for customers
CREATE POLICY "Admins can manage all customers" ON public.customers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own customer record" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Admins can manage all meal plans" ON public.meal_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own meal plans" ON public.meal_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = meal_plans.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for meal_plan_items
CREATE POLICY "Admins can manage all meal plan items" ON public.meal_plan_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own meal plan items" ON public.meal_plan_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans mp
      JOIN public.customers c ON mp.customer_id = c.id
      WHERE mp.id = meal_plan_items.meal_plan_id AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = bookings.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for habits
CREATE POLICY "Admins can manage all habits" ON public.habits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own habits" ON public.habits
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = habits.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for habit_logs
CREATE POLICY "Admins can manage all habit logs" ON public.habit_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own habit logs" ON public.habit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.habits h
      JOIN public.customers c ON h.customer_id = c.id
      WHERE h.id = habit_logs.habit_id AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for check_ins
CREATE POLICY "Admins can manage all check-ins" ON public.check_ins
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own check-ins" ON public.check_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = check_ins.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for food_logs
CREATE POLICY "Admins can manage all food logs" ON public.food_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own food logs" ON public.food_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = food_logs.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for water_logs
CREATE POLICY "Admins can manage all water logs" ON public.water_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can manage own water logs" ON public.water_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = water_logs.customer_id AND user_id = auth.uid())
  );

-- RLS Policies for analytics_events
CREATE POLICY "Admins can view all analytics" ON public.analytics_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.customers WHERE id = analytics_events.customer_id AND user_id = auth.uid())
  );

-- Indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_assigned_admin ON public.customers(assigned_admin_id);
CREATE INDEX idx_meal_plans_customer ON public.meal_plans(customer_id);
CREATE INDEX idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_admin ON public.bookings(admin_id);
CREATE INDEX idx_habits_customer ON public.habits(customer_id);
CREATE INDEX idx_habit_logs_habit ON public.habit_logs(habit_id);
CREATE INDEX idx_check_ins_customer_date ON public.check_ins(customer_id, check_in_date);
CREATE INDEX idx_food_logs_customer_date ON public.food_logs(customer_id, logged_date);
CREATE INDEX idx_water_logs_customer_date ON public.water_logs(customer_id, logged_date);
CREATE INDEX idx_analytics_events_customer ON public.analytics_events(customer_id);

-- Trigger for auto-creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updating updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();