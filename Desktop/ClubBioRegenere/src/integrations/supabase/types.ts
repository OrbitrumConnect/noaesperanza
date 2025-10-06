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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          amount: number
          appointment_date: string
          appointment_time: string
          consultation_type: string
          created_at: string
          doctor_notes: string | null
          id: string
          patient_email: string
          patient_name: string
          payment_status: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_date: string
          appointment_time: string
          consultation_type?: string
          created_at?: string
          doctor_notes?: string | null
          id?: string
          patient_email: string
          patient_name: string
          payment_status?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_date?: string
          appointment_time?: string
          consultation_type?: string
          created_at?: string
          doctor_notes?: string | null
          id?: string
          patient_email?: string
          patient_name?: string
          payment_status?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      biomarcadores_isafe: {
        Row: {
          assessment_date: string
          auto_percepcao_felicidade: number | null
          auto_percepcao_saude: number | null
          auto_relato_animo: number | null
          capacidade_funcional_1: number | null
          capacidade_funcional_2: number | null
          circunferencia_cintura: number | null
          circunferencia_pescoco: number | null
          coeficiente_garra: number | null
          coeficiente_gratidao: number | null
          created_at: string
          disposicao_acordar: number | null
          escala_bristol: number | null
          estresse: number | null
          fadiga: number | null
          gordura_visceral: number | null
          horas_sentado: string | null
          horas_tv_dia: string | null
          horas_tv_fim_semana: string | null
          id: string
          imc: number | null
          isafe_score: number | null
          isafe_zona: string | null
          limitacoes_aspectos_fisicos: number | null
          nivel_ansiedade: number | null
          nivel_dor_1: number | null
          nivel_dor_2: number | null
          nivel_sonolencia: number | null
          percentual_gordura: number | null
          percentual_massa_muscular: number | null
          preensao_manual_direita: number | null
          preensao_manual_esquerda: number | null
          qualidade_sono: number | null
          razao_cintura_estatura: number | null
          razao_cintura_quadril: number | null
          religiao_espiritualidade: number | null
          satisfacao_vida: number | null
          saude_bem_estar_mental: number | null
          saude_emocional: number | null
          saude_geral: number | null
          saude_social: number | null
          user_id: string | null
          vitalidade: number | null
          vo2: number | null
        }
        Insert: {
          assessment_date?: string
          auto_percepcao_felicidade?: number | null
          auto_percepcao_saude?: number | null
          auto_relato_animo?: number | null
          capacidade_funcional_1?: number | null
          capacidade_funcional_2?: number | null
          circunferencia_cintura?: number | null
          circunferencia_pescoco?: number | null
          coeficiente_garra?: number | null
          coeficiente_gratidao?: number | null
          created_at?: string
          disposicao_acordar?: number | null
          escala_bristol?: number | null
          estresse?: number | null
          fadiga?: number | null
          gordura_visceral?: number | null
          horas_sentado?: string | null
          horas_tv_dia?: string | null
          horas_tv_fim_semana?: string | null
          id?: string
          imc?: number | null
          isafe_score?: number | null
          isafe_zona?: string | null
          limitacoes_aspectos_fisicos?: number | null
          nivel_ansiedade?: number | null
          nivel_dor_1?: number | null
          nivel_dor_2?: number | null
          nivel_sonolencia?: number | null
          percentual_gordura?: number | null
          percentual_massa_muscular?: number | null
          preensao_manual_direita?: number | null
          preensao_manual_esquerda?: number | null
          qualidade_sono?: number | null
          razao_cintura_estatura?: number | null
          razao_cintura_quadril?: number | null
          religiao_espiritualidade?: number | null
          satisfacao_vida?: number | null
          saude_bem_estar_mental?: number | null
          saude_emocional?: number | null
          saude_geral?: number | null
          saude_social?: number | null
          user_id?: string | null
          vitalidade?: number | null
          vo2?: number | null
        }
        Update: {
          assessment_date?: string
          auto_percepcao_felicidade?: number | null
          auto_percepcao_saude?: number | null
          auto_relato_animo?: number | null
          capacidade_funcional_1?: number | null
          capacidade_funcional_2?: number | null
          circunferencia_cintura?: number | null
          circunferencia_pescoco?: number | null
          coeficiente_garra?: number | null
          coeficiente_gratidao?: number | null
          created_at?: string
          disposicao_acordar?: number | null
          escala_bristol?: number | null
          estresse?: number | null
          fadiga?: number | null
          gordura_visceral?: number | null
          horas_sentado?: string | null
          horas_tv_dia?: string | null
          horas_tv_fim_semana?: string | null
          id?: string
          imc?: number | null
          isafe_score?: number | null
          isafe_zona?: string | null
          limitacoes_aspectos_fisicos?: number | null
          nivel_ansiedade?: number | null
          nivel_dor_1?: number | null
          nivel_dor_2?: number | null
          nivel_sonolencia?: number | null
          percentual_gordura?: number | null
          percentual_massa_muscular?: number | null
          preensao_manual_direita?: number | null
          preensao_manual_esquerda?: number | null
          qualidade_sono?: number | null
          razao_cintura_estatura?: number | null
          razao_cintura_quadril?: number | null
          religiao_espiritualidade?: number | null
          satisfacao_vida?: number | null
          saude_bem_estar_mental?: number | null
          saude_emocional?: number | null
          saude_geral?: number | null
          saude_social?: number | null
          user_id?: string | null
          vitalidade?: number | null
          vo2?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          biohacking_suggested: string | null
          conversation_stage: string | null
          created_at: string
          data_collected: Json | null
          frequency_suggested: string | null
          id: string
          message_content: string
          message_type: string | null
          microverdes_suggested: string | null
          mood_detected: string | null
          session_id: string | null
          topics_discussed: string[] | null
          user_id: string | null
        }
        Insert: {
          biohacking_suggested?: string | null
          conversation_stage?: string | null
          created_at?: string
          data_collected?: Json | null
          frequency_suggested?: string | null
          id?: string
          message_content: string
          message_type?: string | null
          microverdes_suggested?: string | null
          mood_detected?: string | null
          session_id?: string | null
          topics_discussed?: string[] | null
          user_id?: string | null
        }
        Update: {
          biohacking_suggested?: string | null
          conversation_stage?: string | null
          created_at?: string
          data_collected?: Json | null
          frequency_suggested?: string | null
          id?: string
          message_content?: string
          message_type?: string | null
          microverdes_suggested?: string | null
          mood_detected?: string | null
          session_id?: string | null
          topics_discussed?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_habits: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          exercise_level: number | null
          id: string
          meal_times: Json | null
          mood: string | null
          notes: string | null
          nutrition_quality: number | null
          sleep_quality: number | null
          stress_level: number | null
          supplements_taken: string[] | null
          symptoms: string[] | null
          user_id: string | null
          water_intake: number | null
        }
        Insert: {
          created_at?: string
          date: string
          energy_level?: number | null
          exercise_level?: number | null
          id?: string
          meal_times?: Json | null
          mood?: string | null
          notes?: string | null
          nutrition_quality?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          supplements_taken?: string[] | null
          symptoms?: string[] | null
          user_id?: string | null
          water_intake?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          exercise_level?: number | null
          id?: string
          meal_times?: Json | null
          mood?: string | null
          notes?: string | null
          nutrition_quality?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          supplements_taken?: string[] | null
          symptoms?: string[] | null
          user_id?: string | null
          water_intake?: number | null
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string | null
          description: string | null
          downloads: number | null
          file_url: string
          id: string
          is_active: boolean | null
          read_time: string | null
          title: string
          updated_at: string | null
          upload_date: string | null
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          read_time?: string | null
          title: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          downloads?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          read_time?: string | null
          title?: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Relationships: []
      }
      educational_plans: {
        Row: {
          biohacking_practices: Json | null
          created_at: string
          duration_days: number | null
          exercise_plans: Json | null
          frequency_therapy: Json | null
          id: string
          meal_plans: Json | null
          microverdes_schedule: Json | null
          plan_name: string
          plan_type: string | null
          progress_markers: Json | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          biohacking_practices?: Json | null
          created_at?: string
          duration_days?: number | null
          exercise_plans?: Json | null
          frequency_therapy?: Json | null
          id?: string
          meal_plans?: Json | null
          microverdes_schedule?: Json | null
          plan_name: string
          plan_type?: string | null
          progress_markers?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          biohacking_practices?: Json | null
          created_at?: string
          duration_days?: number | null
          exercise_plans?: Json | null
          frequency_therapy?: Json | null
          id?: string
          meal_plans?: Json | null
          microverdes_schedule?: Json | null
          plan_name?: string
          plan_type?: string | null
          progress_markers?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      educational_resources: {
        Row: {
          category: string | null
          content_type: string | null
          content_url: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          is_premium: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          alcohol_consumption: string | null
          allergies: string[] | null
          created_at: string
          current_medications: string[] | null
          dietary_restrictions: string[] | null
          exercise_routine: string | null
          family_history: string[] | null
          id: string
          medical_conditions: string[] | null
          previous_surgeries: string[] | null
          sleep_hours: number | null
          smoking_habits: string | null
          stress_level: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alcohol_consumption?: string | null
          allergies?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          dietary_restrictions?: string[] | null
          exercise_routine?: string | null
          family_history?: string[] | null
          id?: string
          medical_conditions?: string[] | null
          previous_surgeries?: string[] | null
          sleep_hours?: number | null
          smoking_habits?: string | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alcohol_consumption?: string | null
          allergies?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          dietary_restrictions?: string[] | null
          exercise_routine?: string | null
          family_history?: string[] | null
          id?: string
          medical_conditions?: string[] | null
          previous_surgeries?: string[] | null
          sleep_hours?: number | null
          smoking_habits?: string | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      health_reports: {
        Row: {
          achievements: string[] | null
          biomarcadores: Json | null
          created_at: string
          generated_by: string | null
          id: string
          improvements_needed: string[] | null
          isafe_score: number | null
          isafe_zone: string | null
          next_evaluation_date: string | null
          period_end: string | null
          period_start: string | null
          recommendations: string[] | null
          report_type: string
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          biomarcadores?: Json | null
          created_at?: string
          generated_by?: string | null
          id?: string
          improvements_needed?: string[] | null
          isafe_score?: number | null
          isafe_zone?: string | null
          next_evaluation_date?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          report_type: string
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          biomarcadores?: Json | null
          created_at?: string
          generated_by?: string | null
          id?: string
          improvements_needed?: string[] | null
          isafe_score?: number | null
          isafe_zone?: string | null
          next_evaluation_date?: string | null
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          report_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plan_revisions: {
        Row: {
          changes_requested: Json | null
          created_at: string
          created_by: string
          doctor_notes: string | null
          id: string
          patient_feedback: string | null
          plan_id: string
          revision_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          changes_requested?: Json | null
          created_at?: string
          created_by: string
          doctor_notes?: string | null
          id?: string
          patient_feedback?: string | null
          plan_id: string
          revision_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          changes_requested?: Json | null
          created_at?: string
          created_by?: string
          doctor_notes?: string | null
          id?: string
          patient_feedback?: string | null
          plan_id?: string
          revision_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_revisions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "educational_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          consent_data_usage: boolean | null
          consent_treatment: boolean | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string | null
          gender: string | null
          height: number | null
          id: string
          name: string | null
          occupation: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
          weight: number | null
        }
        Insert: {
          birth_date?: string | null
          consent_data_usage?: boolean | null
          consent_treatment?: boolean | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          birth_date?: string | null
          consent_data_usage?: boolean | null
          consent_treatment?: boolean | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          reminder_type: string
          scheduled_time: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          reminder_type: string
          scheduled_time: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          reminder_type?: string
          scheduled_time?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resource_interactions: {
        Row: {
          completion_percentage: number | null
          created_at: string
          feedback: string | null
          id: string
          interaction_type: string | null
          rating: number | null
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          interaction_type?: string | null
          rating?: number | null
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          interaction_type?: string | null
          rating?: number | null
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_interactions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "educational_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          duration_minutes: number | null
          end_time: string | null
          follow_up_required: boolean | null
          goals_discussed: string[] | null
          id: string
          notes: string | null
          recommendations_given: string[] | null
          satisfaction_rating: number | null
          session_type: string
          start_time: string
          topics_covered: string[] | null
          user_id: string | null
        }
        Insert: {
          duration_minutes?: number | null
          end_time?: string | null
          follow_up_required?: boolean | null
          goals_discussed?: string[] | null
          id?: string
          notes?: string | null
          recommendations_given?: string[] | null
          satisfaction_rating?: number | null
          session_type: string
          start_time?: string
          topics_covered?: string[] | null
          user_id?: string | null
        }
        Update: {
          duration_minutes?: number | null
          end_time?: string | null
          follow_up_required?: boolean | null
          goals_discussed?: string[] | null
          id?: string
          notes?: string | null
          recommendations_given?: string[] | null
          satisfaction_rating?: number | null
          session_type?: string
          start_time?: string
          topics_covered?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          measurement_date: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          measurement_date?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          measurement_date?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string
          goal_type: string
          id: string
          priority: string | null
          status: string | null
          target_date: string | null
          target_value: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description: string
          goal_type: string
          id?: string
          priority?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string
          goal_type?: string
          id?: string
          priority?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_active: boolean | null
          thumbnail: string | null
          title: string
          type: string
          updated_at: string | null
          upload_date: string | null
          url: string
          views: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail?: string | null
          title: string
          type: string
          updated_at?: string | null
          upload_date?: string | null
          url: string
          views?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          upload_date?: string | null
          url?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "patient"
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
      app_role: ["admin", "patient"],
    },
  },
} as const
