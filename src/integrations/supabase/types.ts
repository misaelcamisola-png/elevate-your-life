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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_daily_content: {
        Row: {
          content_date: string
          created_at: string
          gratitude_tip: string | null
          prayers: Json
          saving_tip: string | null
          verses: Json
        }
        Insert: {
          content_date: string
          created_at?: string
          gratitude_tip?: string | null
          prayers: Json
          saving_tip?: string | null
          verses: Json
        }
        Update: {
          content_date?: string
          created_at?: string
          gratitude_tip?: string | null
          prayers?: Json
          saving_tip?: string | null
          verses?: Json
        }
        Relationships: []
      }
      custom_workouts: {
        Row: {
          created_at: string
          day_of_week: number | null
          exercises: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          exercises?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          exercises?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checklist: {
        Row: {
          created_at: string
          id: string
          log_date: string
          meals_done: boolean
          prayer_done: boolean
          reading_done: boolean
          user_id: string
          water_done: boolean
          workout_done: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          meals_done?: boolean
          prayer_done?: boolean
          reading_done?: boolean
          user_id: string
          water_done?: boolean
          workout_done?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          meals_done?: boolean
          prayer_done?: boolean
          reading_done?: boolean
          user_id?: string
          water_done?: boolean
          workout_done?: boolean
        }
        Relationships: []
      }
      finance_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string | null
          entry_date: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          is_main: boolean
          target_amount: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          is_main?: boolean
          target_amount: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          is_main?: boolean
          target_amount?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          food: string
          id: string
          log_date: string
          meal_type: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food: string
          id?: string
          log_date?: string
          meal_type: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food?: string
          id?: string
          log_date?: string
          meal_type?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_logs: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          prayed: boolean
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          prayed?: boolean
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          prayed?: boolean
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          diet_plan: Json | null
          goal: string | null
          height_cm: number | null
          id: string
          name: string | null
          sex: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          diet_plan?: Json | null
          goal?: string | null
          height_cm?: number | null
          id: string
          name?: string | null
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          diet_plan?: Json | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          name?: string | null
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      reading_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          minutes: number
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          minutes?: number
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          minutes?: number
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          calories: number
          created_at: string
          duration_min: number | null
          id: string
          km: number
          run_date: string
          type: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          created_at?: string
          duration_min?: number | null
          id?: string
          km?: number
          run_date?: string
          type?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          created_at?: string
          duration_min?: number | null
          id?: string
          km?: number
          run_date?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          bedtime: string | null
          created_at: string
          hours: number | null
          id: string
          log_date: string
          quality: number | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string
          hours?: number | null
          id?: string
          log_date?: string
          quality?: number | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string
          hours?: number | null
          id?: string
          log_date?: string
          quality?: number | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          created_at: string
          cups: number
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cups?: number
          id?: string
          log_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cups?: number
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          completed: boolean
          created_at: string
          exercises: Json | null
          id: string
          log_date: string
          notes: string | null
          plan_key: string
          user_id: string
          workout_name: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          exercises?: Json | null
          id?: string
          log_date?: string
          notes?: string | null
          plan_key: string
          user_id: string
          workout_name?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          exercises?: Json | null
          id?: string
          log_date?: string
          notes?: string | null
          plan_key?: string
          user_id?: string
          workout_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
