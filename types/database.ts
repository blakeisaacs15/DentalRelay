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
      outcome_letters: {
        Row: {
          created_at: string
          follow_up_notes: string | null
          follow_up_required: boolean
          id: string
          outcome: string
          patient_response: string | null
          provider_id: string
          recommendations: string | null
          referral_id: string
          signature_name: string
          signed_at: string
          signed_by: string
          treatment_performed: string
        }
        Insert: {
          created_at?: string
          follow_up_notes?: string | null
          follow_up_required?: boolean
          id?: string
          outcome: string
          patient_response?: string | null
          provider_id: string
          recommendations?: string | null
          referral_id: string
          signature_name: string
          signed_at?: string
          signed_by: string
          treatment_performed: string
        }
        Update: {
          created_at?: string
          follow_up_notes?: string | null
          follow_up_required?: boolean
          id?: string
          outcome?: string
          patient_response?: string | null
          provider_id?: string
          recommendations?: string | null
          referral_id?: string
          signature_name?: string
          signed_at?: string
          signed_by?: string
          treatment_performed?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_letters_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_letters_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_letters_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          dob: string
          email: string | null
          first_name: string
          id: string
          insurance_member_id: string | null
          insurance_provider: string | null
          last_name: string
          phone: string | null
          practice_id: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          dob: string
          email?: string | null
          first_name: string
          id?: string
          insurance_member_id?: string | null
          insurance_provider?: string | null
          last_name: string
          phone?: string | null
          practice_id?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          dob?: string
          email?: string | null
          first_name?: string
          id?: string
          insurance_member_id?: string | null
          insurance_provider?: string | null
          last_name?: string
          phone?: string | null
          practice_id?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          address: string | null
          city: string | null
          clerk_org_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          npi: string | null
          phone: string | null
          specialty: string | null
          state: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          clerk_org_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          npi?: string | null
          phone?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          clerk_org_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          npi?: string | null
          phone?: string | null
          specialty?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          clerk_user_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          npi: string | null
          phone: string | null
          practice_id: string | null
          role: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          license_number?: string | null
          npi?: string | null
          phone?: string | null
          practice_id?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          npi?: string | null
          phone?: string | null
          practice_id?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_documents: {
        Row: {
          created_at: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          referral_id: string
          signed_at: string | null
          signed_by: string | null
          storage_path: string
          type: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          referral_id: string
          signed_at?: string | null
          signed_by?: string | null
          storage_path: string
          type: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          referral_id?: string
          signed_at?: string | null
          signed_by?: string | null
          storage_path?: string
          type?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_documents_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          referral_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          referral_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          referral_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_messages_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          appointment_date: string | null
          clinical_data: Json | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          priority: string
          receiving_practice_id: string
          receiving_provider_id: string | null
          referring_practice_id: string
          referring_provider_id: string
          status: string
          treatment: string
          updated_at: string
        }
        Insert: {
          appointment_date?: string | null
          clinical_data?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string
          receiving_practice_id: string
          receiving_provider_id?: string | null
          referring_practice_id: string
          referring_provider_id: string
          status?: string
          treatment: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string | null
          clinical_data?: Json | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string
          receiving_practice_id?: string
          receiving_provider_id?: string | null
          referring_practice_id?: string
          referring_provider_id?: string
          status?: string
          treatment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_receiving_practice_id_fkey"
            columns: ["receiving_practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_receiving_provider_id_fkey"
            columns: ["receiving_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_practice_id_fkey"
            columns: ["referring_practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referring_provider_id_fkey"
            columns: ["referring_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_outcome_letter: {
        Args: {
          p_follow_up_notes?: string
          p_follow_up_required?: boolean
          p_outcome: string
          p_patient_response?: string
          p_provider_id: string
          p_recommendations?: string
          p_referral_id: string
          p_signature_name: string
          p_signed_by?: string
          p_treatment_performed: string
        }
        Returns: string
      }
      create_patient: {
        Args: {
          p_dob: string
          p_email?: string
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_practice_id: string
        }
        Returns: string
      }
      create_referral: {
        Args: {
          p_clinical_data?: Json
          p_notes?: string
          p_patient_id: string
          p_priority?: string
          p_receiving_practice_id: string
          p_receiving_provider_id?: string
          p_referring_practice_id: string
          p_referring_provider_id: string
          p_treatment: string
        }
        Returns: string
      }
      current_practice_id: { Args: never; Returns: string }
      get_outcome_letters: {
        Args: { p_referral_id: string }
        Returns: {
          created_at: string
          follow_up_notes: string
          follow_up_required: boolean
          id: string
          outcome: string
          patient_response: string
          practice_name: string
          provider_first_name: string
          provider_id: string
          provider_last_name: string
          provider_specialty: string
          recommendations: string
          signature_name: string
          signed_at: string
          treatment_performed: string
        }[]
      }
      get_patients_for_practice: {
        Args: { p_practice_id: string; p_query?: string }
        Returns: {
          dob: string
          email: string
          first_name: string
          id: string
          insurance_provider: string
          last_name: string
          last_referral_at: string
          last_referral_status: string
          phone: string
          referral_count: number
        }[]
      }
      get_providers_by_practice: {
        Args: { p_practice_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
          specialty: string
        }[]
      }
      get_referral_detail: {
        Args: { p_referral_id: string }
        Returns: {
          appointment_date: string
          completed_at: string
          created_at: string
          from_practice_city: string
          from_practice_id: string
          from_practice_name: string
          from_practice_state: string
          from_provider_first: string
          from_provider_id: string
          from_provider_last: string
          from_provider_specialty: string
          id: string
          notes: string
          patient_dob: string
          patient_email: string
          patient_first_name: string
          patient_id: string
          patient_last_name: string
          patient_phone: string
          priority: string
          status: string
          to_practice_city: string
          to_practice_id: string
          to_practice_name: string
          to_practice_state: string
          to_provider_first: string
          to_provider_id: string
          to_provider_last: string
          to_provider_specialty: string
          treatment: string
        }[]
      }
      get_referral_inbox_data: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          created_at: string
          from_practice_name: string
          from_provider_first: string
          from_provider_last: string
          id: string
          patient_dob: string
          patient_first_name: string
          patient_last_name: string
          status: string
          to_practice_name: string
          to_provider_first: string
          to_provider_last: string
          treatment: string
        }[]
      }
      get_referral_messages: {
        Args: { p_referral_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          sender_first_name: string
          sender_id: string
          sender_last_name: string
          sender_practice_name: string
        }[]
      }
      get_referral_status_counts: {
        Args: never
        Returns: {
          count: number
          status: string
        }[]
      }
      search_patients: {
        Args: { p_practice_id?: string; p_query?: string }
        Returns: {
          dob: string
          first_name: string
          id: string
          last_name: string
        }[]
      }
      search_practices: {
        Args: { p_exclude_id?: string; p_query?: string }
        Returns: {
          city: string
          id: string
          name: string
          specialty: string
          state: string
        }[]
      }
      send_referral_message: {
        Args: { p_content: string; p_referral_id: string; p_sender_id: string }
        Returns: string
      }
      update_referral_status: {
        Args: { p_referral_id: string; p_status: string }
        Returns: undefined
      }
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
