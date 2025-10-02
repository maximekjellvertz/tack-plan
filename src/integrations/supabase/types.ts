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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          badge_type: string
          created_at: string
          description: string | null
          earned_date: string
          horse_id: string | null
          icon: string | null
          id: string
          is_manual: boolean
          title: string
          user_id: string
        }
        Insert: {
          badge_type: string
          created_at?: string
          description?: string | null
          earned_date?: string
          horse_id?: string | null
          icon?: string | null
          id?: string
          is_manual?: boolean
          title: string
          user_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string
          description?: string | null
          earned_date?: string
          horse_id?: string | null
          icon?: string | null
          id?: string
          is_manual?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_rules: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      competitions: {
        Row: {
          accommodation_info: string | null
          classes: Json | null
          created_at: string
          date: string
          discipline: string
          email: string | null
          id: string
          location: string
          name: string
          organizer: string | null
          phone: string | null
          registration_deadline: string | null
          registration_status: string | null
          status: string | null
          tdb_id: string | null
          time: string | null
          transport_vehicle: string | null
          travel_companions: string | null
          travel_departure_time: string | null
          travel_notes: string | null
          updated_at: string
          user_id: string
          venue_map_url: string | null
          website: string | null
        }
        Insert: {
          accommodation_info?: string | null
          classes?: Json | null
          created_at?: string
          date: string
          discipline: string
          email?: string | null
          id?: string
          location: string
          name: string
          organizer?: string | null
          phone?: string | null
          registration_deadline?: string | null
          registration_status?: string | null
          status?: string | null
          tdb_id?: string | null
          time?: string | null
          transport_vehicle?: string | null
          travel_companions?: string | null
          travel_departure_time?: string | null
          travel_notes?: string | null
          updated_at?: string
          user_id: string
          venue_map_url?: string | null
          website?: string | null
        }
        Update: {
          accommodation_info?: string | null
          classes?: Json | null
          created_at?: string
          date?: string
          discipline?: string
          email?: string | null
          id?: string
          location?: string
          name?: string
          organizer?: string | null
          phone?: string | null
          registration_deadline?: string | null
          registration_status?: string | null
          status?: string | null
          tdb_id?: string | null
          time?: string | null
          transport_vehicle?: string | null
          travel_companions?: string | null
          travel_departure_time?: string | null
          travel_notes?: string | null
          updated_at?: string
          user_id?: string
          venue_map_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          auto_calculate: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          goal_type: string
          horse_id: string | null
          id: string
          is_completed: boolean
          progress_percent: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_calculate?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          horse_id?: string | null
          id?: string
          is_completed?: boolean
          progress_percent?: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_calculate?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_type?: string
          horse_id?: string | null
          id?: string
          is_completed?: boolean
          progress_percent?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      health_logs: {
        Row: {
          created_at: string
          event: string
          horse_id: string | null
          horse_name: string
          id: string
          images: Json | null
          notes: string | null
          severity: string
          status: string
          treatment: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event: string
          horse_id?: string | null
          horse_name: string
          id?: string
          images?: Json | null
          notes?: string | null
          severity: string
          status?: string
          treatment: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event?: string
          horse_id?: string | null
          horse_name?: string
          id?: string
          images?: Json | null
          notes?: string | null
          severity?: string
          status?: string
          treatment?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_logs_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      horses: {
        Row: {
          age: number
          birth_date: string | null
          breed: string
          color: string
          competitions_this_year: number | null
          created_at: string
          diet_feed: string | null
          diet_restrictions: string | null
          diet_supplements: string | null
          discipline: string
          fun_fact: string | null
          gender: string | null
          id: string
          image_url: string | null
          level: string
          microchip: string | null
          name: string
          personality_trait: string | null
          placements: number | null
          registration_number: string | null
          training_sessions: number | null
          updated_at: string
          user_id: string
          vet_visits: number | null
        }
        Insert: {
          age: number
          birth_date?: string | null
          breed: string
          color: string
          competitions_this_year?: number | null
          created_at?: string
          diet_feed?: string | null
          diet_restrictions?: string | null
          diet_supplements?: string | null
          discipline: string
          fun_fact?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          level: string
          microchip?: string | null
          name: string
          personality_trait?: string | null
          placements?: number | null
          registration_number?: string | null
          training_sessions?: number | null
          updated_at?: string
          user_id: string
          vet_visits?: number | null
        }
        Update: {
          age?: number
          birth_date?: string | null
          breed?: string
          color?: string
          competitions_this_year?: number | null
          created_at?: string
          diet_feed?: string | null
          diet_restrictions?: string | null
          diet_supplements?: string | null
          discipline?: string
          fun_fact?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          level?: string
          microchip?: string | null
          name?: string
          personality_trait?: string | null
          placements?: number | null
          registration_number?: string | null
          training_sessions?: number | null
          updated_at?: string
          user_id?: string
          vet_visits?: number | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          achieved_date: string
          created_at: string
          description: string | null
          goal_id: string | null
          horse_id: string | null
          icon: string | null
          id: string
          milestone_type: string
          title: string
          user_id: string
        }
        Insert: {
          achieved_date: string
          created_at?: string
          description?: string | null
          goal_id?: string | null
          horse_id?: string | null
          icon?: string | null
          id?: string
          milestone_type?: string
          title: string
          user_id: string
        }
        Update: {
          achieved_date?: string
          created_at?: string
          description?: string | null
          goal_id?: string | null
          horse_id?: string | null
          icon?: string | null
          id?: string
          milestone_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_list_items: {
        Row: {
          category: string
          competition_id: string | null
          created_at: string
          id: string
          is_checked: boolean
          name: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          category?: string
          competition_id?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          name: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          category?: string
          competition_id?: string | null
          created_at?: string
          id?: string
          is_checked?: boolean
          name?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_list_items_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_list_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "packing_list_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_list_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          description: string | null
          horse_id: string | null
          horse_name: string | null
          id: string
          recurring: boolean | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          description?: string | null
          horse_id?: string | null
          horse_name?: string | null
          id?: string
          recurring?: boolean | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          description?: string | null
          horse_id?: string | null
          horse_name?: string | null
          id?: string
          recurring?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          },
        ]
      }
      tdb_credentials: {
        Row: {
          created_at: string
          id: string
          last_synced_at: string | null
          tdb_email: string
          tdb_password_encrypted: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          tdb_email: string
          tdb_password_encrypted: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          tdb_email?: string
          tdb_password_encrypted?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string
          date: string
          duration: string | null
          horse_id: string
          horse_name: string
          id: string
          intensity: string | null
          notes: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: string | null
          horse_id: string
          horse_name: string
          id?: string
          intensity?: string | null
          notes?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: string | null
          horse_id?: string
          horse_name?: string
          id?: string
          intensity?: string | null
          notes?: string | null
          type?: string
          updated_at?: string
          user_id?: string
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
