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
      patient_tasks: {
        Row: {
          assigned_at: string | null
          completed: boolean | null
          completed_at: string | null
          due_date: string | null
          id: string
          patient_id: string
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          completed?: boolean | null
          completed_at?: string | null
          due_date?: string | null
          id?: string
          patient_id: string
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          completed?: boolean | null
          completed_at?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          active: boolean | null
          created_at: string | null
          diagnosis: string | null
          id: string
          notes: string | null
          therapist_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          diagnosis?: string | null
          id: string
          notes?: string | null
          therapist_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          notes?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      progress_daily: {
        Row: {
          area: string
          date: string
          id: string
          patient_id: string
          percentage: number
          tasks_completed: number
          time_spent_minutes: number
        }
        Insert: {
          area: string
          date: string
          id?: string
          patient_id: string
          percentage?: number
          tasks_completed?: number
          time_spent_minutes?: number
        }
        Update: {
          area?: string
          date?: string
          id?: string
          patient_id?: string
          percentage?: number
          tasks_completed?: number
          time_spent_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_daily_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      task_responses: {
        Row: {
          id: string
          patient_id: string
          patient_task_id: string
          recording_url: string | null
          responded_at: string | null
          score: number | null
          selected_options: Json | null
          therapist_note: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          patient_task_id: string
          recording_url?: string | null
          responded_at?: string | null
          score?: number | null
          selected_options?: Json | null
          therapist_note?: string | null
        }
        Update: {
          id?: string
          patient_id?: string
          patient_task_id?: string
          recording_url?: string | null
          responded_at?: string | null
          score?: number | null
          selected_options?: Json | null
          therapist_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_responses_patient_task_id_fkey"
            columns: ["patient_task_id"]
            isOneToOne: false
            referencedRelation: "patient_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          area: string
          content: Json
          created_at: string | null
          created_by: string | null
          description: string
          duration_minutes: number
          id: string
          title: string
          type: string
        }
        Insert: {
          area: string
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          title: string
          type: string
        }
        Update: {
          area?: string
          content?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
