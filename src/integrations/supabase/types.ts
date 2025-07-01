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
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generation_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          generated_by: string
          generation_type: string
          id: string
          input_data: Json | null
          model_used: string | null
          output_data: Json | null
          processing_time: number | null
          project_id: string | null
          success: boolean | null
          tokens_used: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          generated_by: string
          generation_type: string
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          processing_time?: number | null
          project_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          generated_by?: string
          generation_type?: string
          id?: string
          input_data?: Json | null
          model_used?: string | null
          output_data?: Json | null
          processing_time?: number | null
          project_id?: string | null
          success?: boolean | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_scripts: {
        Row: {
          created_at: string | null
          created_by: string
          framework: string | null
          id: string
          language: string | null
          last_execution_status:
            | Database["public"]["Enums"]["test_execution_status"]
            | null
          name: string
          script_content: string
          self_healing_enabled: boolean | null
          test_case_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          framework?: string | null
          id?: string
          language?: string | null
          last_execution_status?:
            | Database["public"]["Enums"]["test_execution_status"]
            | null
          name: string
          script_content: string
          self_healing_enabled?: boolean | null
          test_case_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          framework?: string | null
          id?: string
          language?: string | null
          last_execution_status?:
            | Database["public"]["Enums"]["test_execution_status"]
            | null
          name?: string
          script_content?: string
          self_healing_enabled?: boolean | null
          test_case_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_scripts_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      bugs: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          environment_info: Json | null
          id: string
          reported_by: string
          reproduction_steps: string | null
          screenshots: Json | null
          severity: Database["public"]["Enums"]["bug_severity"] | null
          status: Database["public"]["Enums"]["bug_status"] | null
          test_case_id: string | null
          test_execution_id: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          environment_info?: Json | null
          id?: string
          reported_by: string
          reproduction_steps?: string | null
          screenshots?: Json | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          status?: Database["public"]["Enums"]["bug_status"] | null
          test_case_id?: string | null
          test_execution_id?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          environment_info?: Json | null
          id?: string
          reported_by?: string
          reproduction_steps?: string | null
          screenshots?: Json | null
          severity?: Database["public"]["Enums"]["bug_severity"] | null
          status?: Database["public"]["Enums"]["bug_status"] | null
          test_case_id?: string | null
          test_execution_id?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bugs_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_test_execution_id_fkey"
            columns: ["test_execution_id"]
            isOneToOne: false
            referencedRelation: "test_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      epics: {
        Row: {
          acceptance_criteria: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          priority: number | null
          project_id: string | null
          status: Database["public"]["Enums"]["epic_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          priority?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["epic_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          priority?: number | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["epic_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          app_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          app_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          app_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scraped_pages: {
        Row: {
          content_chunks: Json | null
          created_by: string
          dom_elements: Json | null
          id: string
          project_id: string | null
          scraped_at: string | null
          screenshots: Json | null
          title: string | null
          url: string
        }
        Insert: {
          content_chunks?: Json | null
          created_by: string
          dom_elements?: Json | null
          id?: string
          project_id?: string | null
          scraped_at?: string | null
          screenshots?: Json | null
          title?: string | null
          url: string
        }
        Update: {
          content_chunks?: Json | null
          created_by?: string
          dom_elements?: Json | null
          id?: string
          project_id?: string | null
          scraped_at?: string | null
          screenshots?: Json | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraped_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cases: {
        Row: {
          automation_script_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          expected_results: string | null
          generated_by_ai: boolean | null
          id: string
          preconditions: string | null
          priority: number | null
          rag_enhanced: boolean | null
          status: Database["public"]["Enums"]["test_case_status"] | null
          test_steps: Json | null
          title: string
          updated_at: string | null
          user_story_id: string | null
        }
        Insert: {
          automation_script_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          expected_results?: string | null
          generated_by_ai?: boolean | null
          id?: string
          preconditions?: string | null
          priority?: number | null
          rag_enhanced?: boolean | null
          status?: Database["public"]["Enums"]["test_case_status"] | null
          test_steps?: Json | null
          title: string
          updated_at?: string | null
          user_story_id?: string | null
        }
        Update: {
          automation_script_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          expected_results?: string | null
          generated_by_ai?: boolean | null
          id?: string
          preconditions?: string | null
          priority?: number | null
          rag_enhanced?: boolean | null
          status?: Database["public"]["Enums"]["test_case_status"] | null
          test_steps?: Json | null
          title?: string
          updated_at?: string | null
          user_story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_automation_script"
            columns: ["automation_script_id"]
            isOneToOne: false
            referencedRelation: "automation_scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_user_story_id_fkey"
            columns: ["user_story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      test_executions: {
        Row: {
          automation_script_id: string | null
          executed_at: string | null
          executed_by: string
          execution_details: Json | null
          execution_time: number | null
          id: string
          status: Database["public"]["Enums"]["test_execution_status"] | null
          test_case_id: string | null
        }
        Insert: {
          automation_script_id?: string | null
          executed_at?: string | null
          executed_by: string
          execution_details?: Json | null
          execution_time?: number | null
          id?: string
          status?: Database["public"]["Enums"]["test_execution_status"] | null
          test_case_id?: string | null
        }
        Update: {
          automation_script_id?: string | null
          executed_at?: string | null
          executed_by?: string
          execution_details?: Json | null
          execution_time?: number | null
          id?: string
          status?: Database["public"]["Enums"]["test_execution_status"] | null
          test_case_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_executions_automation_script_id_fkey"
            columns: ["automation_script_id"]
            isOneToOne: false
            referencedRelation: "automation_scripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_executions_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          acceptance_criteria: string | null
          created_at: string | null
          created_by: string
          description: string | null
          epic_id: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["story_status"] | null
          story_points: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          epic_id?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_points?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          epic_id?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["story_status"] | null
          story_points?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
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
      bug_severity: "critical" | "high" | "medium" | "low"
      bug_status: "open" | "in_progress" | "resolved" | "closed" | "rejected"
      epic_status: "draft" | "in_progress" | "completed" | "cancelled"
      project_status: "active" | "inactive" | "archived"
      story_status:
        | "draft"
        | "in_progress"
        | "ready_for_testing"
        | "completed"
        | "cancelled"
      test_case_status: "draft" | "active" | "obsolete"
      test_execution_status:
        | "not_run"
        | "passed"
        | "failed"
        | "blocked"
        | "skipped"
      user_role: "admin" | "qa_lead" | "qa_engineer" | "developer" | "viewer"
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
    Enums: {
      bug_severity: ["critical", "high", "medium", "low"],
      bug_status: ["open", "in_progress", "resolved", "closed", "rejected"],
      epic_status: ["draft", "in_progress", "completed", "cancelled"],
      project_status: ["active", "inactive", "archived"],
      story_status: [
        "draft",
        "in_progress",
        "ready_for_testing",
        "completed",
        "cancelled",
      ],
      test_case_status: ["draft", "active", "obsolete"],
      test_execution_status: [
        "not_run",
        "passed",
        "failed",
        "blocked",
        "skipped",
      ],
      user_role: ["admin", "qa_lead", "qa_engineer", "developer", "viewer"],
    },
  },
} as const
