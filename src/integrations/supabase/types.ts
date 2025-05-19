export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assembly_decisions: {
        Row: {
          approved: boolean
          assembly_date: string
          created_at: string
          created_by: string
          decision_text: string
          id: string
          title: string
          updated_at: string
          votes_abstain: number
          votes_against: number
          votes_for: number
        }
        Insert: {
          approved?: boolean
          assembly_date: string
          created_at?: string
          created_by: string
          decision_text: string
          id?: string
          title: string
          updated_at?: string
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
        }
        Update: {
          approved?: boolean
          assembly_date?: string
          created_at?: string
          created_by?: string
          decision_text?: string
          id?: string
          title?: string
          updated_at?: string
          votes_abstain?: number
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
      }
      board_members: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          photo_url: string | null
          position: string
          resident_id: string | null
          term_end: string | null
          term_start: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          position: string
          resident_id?: string | null
          term_end?: string | null
          term_start: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          position?: string
          resident_id?: string | null
          term_end?: string | null
          term_start?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_members_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      fee_configuration: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          public: boolean | null
          receipt_url: string | null
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          public?: boolean | null
          receipt_url?: string | null
          transaction_date: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          public?: boolean | null
          receipt_url?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      meeting_minutes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          document_url: string | null
          id: string
          meeting_date: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          document_url?: string | null
          id?: string
          meeting_date: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          document_url?: string | null
          id?: string
          meeting_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          target_role: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          id?: string
          target_role?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          target_role?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          payment_date: string | null
          reference_month: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          payment_date?: string | null
          reference_month: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          payment_date?: string | null
          reference_month?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          description: string
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      request_responses: {
        Row: {
          created_at: string
          created_by: string
          id: string
          request_id: string
          response: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          request_id: string
          response: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          request_id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          birth_date: string
          city: string
          complement: string | null
          cpf: string
          created_at: string | null
          created_by: string | null
          director_position: string | null
          electoral_section: string
          electoral_zone: string
          email: string
          id: string
          id_document_url: string
          is_director: boolean | null
          name: string
          neighborhood: string
          number: string
          phone: string
          proof_of_residence_url: string
          rg: string
          state: string
          status: string
          street: string
          user_id: string | null
          voter_title: string
          zip_code: string
        }
        Insert: {
          birth_date: string
          city: string
          complement?: string | null
          cpf: string
          created_at?: string | null
          created_by?: string | null
          director_position?: string | null
          electoral_section: string
          electoral_zone: string
          email: string
          id?: string
          id_document_url: string
          is_director?: boolean | null
          name: string
          neighborhood: string
          number: string
          phone: string
          proof_of_residence_url: string
          rg: string
          state: string
          status: string
          street: string
          user_id?: string | null
          voter_title: string
          zip_code: string
        }
        Update: {
          birth_date?: string
          city?: string
          complement?: string | null
          cpf?: string
          created_at?: string | null
          created_by?: string | null
          director_position?: string | null
          electoral_section?: string
          electoral_zone?: string
          email?: string
          id?: string
          id_document_url?: string
          is_director?: boolean | null
          name?: string
          neighborhood?: string
          number?: string
          phone?: string
          proof_of_residence_url?: string
          rg?: string
          state?: string
          status?: string
          street?: string
          user_id?: string | null
          voter_title?: string
          zip_code?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          public: boolean
          receipt_url: string | null
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          public?: boolean
          receipt_url?: string | null
          transaction_date: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          public?: boolean
          receipt_url?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      board_members_with_user: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string | null
          photo_url: string | null
          position: string | null
          term_end: string | null
          term_start: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_insert_fee_configuration: {
        Args: { p_amount: number; p_start_date: string; p_description?: string }
        Returns: string
      }
      bypass_insert_fee_configuration: {
        Args: { p_amount: number; p_start_date: string; p_description?: string }
        Returns: Json
      }
      generate_monthly_fees_batch: {
        Args:
          | {
              p_reference_month: string
              p_due_date: string
              p_description?: string
            }
          | {
              p_reference_month: string
              p_due_date: string
              p_description?: string
              p_custom_amount?: number
            }
        Returns: {
          inserted_count: number
          total_amount: number
          month_year: string
        }[]
      }
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_for_roles: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_director: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          name: string
          role: string
        }[]
      }
      update_existing_user_roles: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
