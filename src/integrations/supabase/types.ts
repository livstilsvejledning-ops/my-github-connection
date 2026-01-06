export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_id: string | null
          booking_type: string
          created_at: string | null
          customer_id: string | null
          duration_minutes: number | null
          id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string | null
        }
        Insert: {
          admin_id?: string | null
          booking_type: string
          created_at?: string | null
          customer_id?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string | null
        }
        Update: {
          admin_id?: string | null
          booking_type?: string
          created_at?: string | null
          customer_id?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          check_in_date: string
          created_at: string | null
          customer_id: string | null
          energy_score: number | null
          hunger_level: number | null
          id: string
          mood_score: number | null
          notes: string | null
          sleep_hours: number | null
          stress_level: number | null
          weight_kg: number | null
        }
        Insert: {
          check_in_date: string
          created_at?: string | null
          customer_id?: string | null
          energy_score?: number | null
          hunger_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          weight_kg?: number | null
        }
        Update: {
          check_in_date?: string
          created_at?: string | null
          customer_id?: string | null
          energy_score?: number | null
          hunger_level?: number | null
          id?: string
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          assigned_admin_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_type: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          customer_id: string | null
          fat_g: number | null
          food_name: string
          id: string
          logged_date: string
          meal_type: string | null
          notes: string | null
          protein_g: number | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          customer_id?: string | null
          fat_g?: number | null
          food_name: string
          id?: string
          logged_date: string
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          customer_id?: string | null
          fat_g?: number | null
          food_name?: string
          id?: string
          logged_date?: string
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          habit_id: string
          id: string
          logged_date: string
          notes: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          habit_id: string
          id?: string
          logged_date: string
          notes?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          habit_id?: string
          id?: string
          logged_date?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          color: string | null
          created_at: string | null
          customer_id: string | null
          habit_name: string
          icon: string | null
          id: string
          target_frequency: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          habit_name: string
          icon?: string | null
          id?: string
          target_frequency?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          habit_name?: string
          icon?: string | null
          id?: string
          target_frequency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          day_of_week: number | null
          fat_g: number | null
          id: string
          instructions: string | null
          meal_plan_id: string
          meal_type: string | null
          protein_g: number | null
          recipe_name: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          day_of_week?: number | null
          fat_g?: number | null
          id?: string
          instructions?: string | null
          meal_plan_id: string
          meal_type?: string | null
          protein_g?: number | null
          recipe_name: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          day_of_week?: number | null
          fat_g?: number | null
          id?: string
          instructions?: string | null
          meal_plan_id?: string
          meal_type?: string | null
          protein_g?: number | null
          recipe_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          daily_calories: number | null
          end_date: string
          id: string
          name: string
          notes: string | null
          start_date: string
          updated_at: string | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          daily_calories?: number | null
          end_date: string
          id?: string
          name: string
          notes?: string | null
          start_date: string
          updated_at?: string | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          daily_calories?: number | null
          end_date?: string
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          from_user_id: string | null
          id: string
          is_automated: boolean | null
          is_read: boolean | null
          subject: string | null
          to_user_id: string | null
          trigger_type: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_automated?: boolean | null
          is_read?: boolean | null
          subject?: string | null
          to_user_id?: string | null
          trigger_type?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          is_automated?: boolean | null
          is_read?: boolean | null
          subject?: string | null
          to_user_id?: string | null
          trigger_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          full_name: string
          gender: string | null
          height_cm: number | null
          id: string
          phone: string | null
          profile_image_url: string | null
          updated_at: string | null
          weight_goal_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          full_name: string
          gender?: string | null
          height_cm?: number | null
          id: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          weight_goal_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          weight_goal_kg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          customer_id: string | null
          id: string
          logged_date: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          customer_id?: string | null
          id?: string
          logged_date: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          customer_id?: string | null
          id?: string
          logged_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
