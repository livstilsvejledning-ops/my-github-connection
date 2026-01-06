export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  height_cm: number | null;
  weight_goal_kg: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'client';
}

export interface Customer {
  id: string;
  user_id: string;
  assigned_admin_id: string | null;
  status: 'active' | 'inactive' | 'on_hold' | 'completed';
  subscription_type: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: Profile;
}

export interface MealPlan {
  id: string;
  customer_id: string;
  name: string;
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  day_of_week: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  instructions: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  subject: string | null;
  body: string;
  is_read: boolean;
  is_automated: boolean;
  trigger_type: string | null;
  created_at: string;
  // Joined data
  from_profile?: Profile;
  to_profile?: Profile;
}

export interface Booking {
  id: string;
  customer_id: string | null;
  admin_id: string | null;
  booking_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  meeting_link: string | null;
  created_at: string;
  // Joined data
  customer?: Customer;
}

export interface Habit {
  id: string;
  customer_id: string | null;
  habit_name: string;
  target_frequency: number;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  logged_date: string;
  completed: boolean;
  notes: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  customer_id: string | null;
  check_in_date: string;
  weight_kg: number | null;
  mood_score: number | null;
  energy_score: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  hunger_level: number | null;
  notes: string | null;
  created_at: string;
}

export interface FoodLog {
  id: string;
  customer_id: string | null;
  logged_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string | null;
  created_at: string;
}

export interface WaterLog {
  id: string;
  customer_id: string | null;
  logged_date: string;
  amount_ml: number;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  customer_id: string | null;
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}
