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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assignment_files: {
        Row: {
          course_code: string
          created_at: string
          fetched_at: string
          id: string
          kind: string
          pdf_url: string | null
          session: string
          source_url: string | null
          status: string
        }
        Insert: {
          course_code: string
          created_at?: string
          fetched_at?: string
          id?: string
          kind?: string
          pdf_url?: string | null
          session: string
          source_url?: string | null
          status?: string
        }
        Update: {
          course_code?: string
          created_at?: string
          fetched_at?: string
          id?: string
          kind?: string
          pdf_url?: string | null
          session?: string
          source_url?: string | null
          status?: string
        }
        Relationships: []
      }
      assignment_status_records: {
        Row: {
          course_code: string
          fetched_at: string
          id: string
          marks: string | null
          programme: string
          remarks: string | null
          session: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          course_code: string
          fetched_at?: string
          id?: string
          marks?: string | null
          programme: string
          remarks?: string | null
          session?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          course_code?: string
          fetched_at?: string
          id?: string
          marks?: string | null
          programme?: string
          remarks?: string | null
          session?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          course_code: string
          created_at: string
          id: string
          marks: number | null
          session: string
          status: string
          submitted_on: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          id?: string
          marks?: number | null
          session: string
          status?: string
          submitted_on?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          id?: string
          marks?: number | null
          session?: string
          status?: string
          submitted_on?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      download_history: {
        Row: {
          course_code: string
          created_at: string
          id: string
          label: string
          pdf_url: string | null
          resource_type: string
          saved: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          id?: string
          label: string
          pdf_url?: string | null
          resource_type: string
          saved?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          id?: string
          label?: string
          pdf_url?: string | null
          resource_type?: string
          saved?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grade_card_records: {
        Row: {
          assignment_marks: number | null
          course_code: string
          created_at: string
          fetched_at: string
          id: string
          practical_marks: number | null
          programme: string
          status: string | null
          theory_marks: number | null
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_marks?: number | null
          course_code: string
          created_at?: string
          fetched_at?: string
          id?: string
          practical_marks?: number | null
          programme: string
          status?: string | null
          theory_marks?: number | null
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_marks?: number | null
          course_code?: string
          created_at?: string
          fetched_at?: string
          id?: string
          practical_marks?: number | null
          programme?: string
          status?: string | null
          theory_marks?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_semester: number | null
          enrolment_no: string | null
          full_name: string | null
          id: string
          ignou_summary: Json | null
          last_synced_at: string | null
          programme_code: string
          study_centre: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_semester?: number | null
          enrolment_no?: string | null
          full_name?: string | null
          id: string
          ignou_summary?: Json | null
          last_synced_at?: string | null
          programme_code?: string
          study_centre?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_semester?: number | null
          enrolment_no?: string | null
          full_name?: string | null
          id?: string
          ignou_summary?: Json | null
          last_synced_at?: string | null
          programme_code?: string
          study_centre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_papers: {
        Row: {
          course_code: string
          created_at: string
          fetched_at: string
          has_solution: boolean
          id: string
          pdf_url: string | null
          session: string
          source_url: string | null
          status: string
          title: string | null
          year: number
        }
        Insert: {
          course_code: string
          created_at?: string
          fetched_at?: string
          has_solution?: boolean
          id?: string
          pdf_url?: string | null
          session: string
          source_url?: string | null
          status?: string
          title?: string | null
          year: number
        }
        Update: {
          course_code?: string
          created_at?: string
          fetched_at?: string
          has_solution?: boolean
          id?: string
          pdf_url?: string | null
          session?: string
          source_url?: string | null
          status?: string
          title?: string | null
          year?: number
        }
        Relationships: []
      }
      study_plan: {
        Row: {
          course_code: string
          created_at: string
          daily_minutes: number
          id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          daily_minutes?: number
          id?: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          daily_minutes?: number
          id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_progress: {
        Row: {
          completed: boolean
          course_code: string
          created_at: string
          id: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_code: string
          created_at?: string
          id?: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_code?: string
          created_at?: string
          id?: string
          topic?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
