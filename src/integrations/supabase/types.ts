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
      activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          break_end: string | null
          break_start: string | null
          clock_in: string
          clock_out: string | null
          created_at: string
          id: string
          notes: string | null
          status: string | null
          team_member_id: string
          total_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          team_member_id: string
          total_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          clock_in?: string
          clock_out?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string | null
          team_member_id?: string
          total_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members_public"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_attempts: {
        Row: {
          attempt_type: string
          created_at: string | null
          id: string
          identifier: string
          ip_address: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string | null
          id?: string
          identifier: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string | null
          id?: string
          identifier?: string
          ip_address?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ceo_security: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          last_verified_at: string | null
          pin_hash: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          pin_hash: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          pin_hash?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      company_info: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          discount_applied: number
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_applied: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_applied?: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          new_users_only: boolean | null
          per_user_limit: number | null
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          new_users_only?: boolean | null
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          new_users_only?: boolean | null
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          event_date: string
          gallery_images: Json | null
          gallery_videos: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          name: string
          ticket_price: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          event_date: string
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          name: string
          ticket_price?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          event_date?: string
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          name?: string
          ticket_price?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          paid_by: string | null
          receipt_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          paid_by?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          paid_by?: string | null
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_current_company: string | null
          applicant_current_role: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          availability: string | null
          cover_letter: string | null
          created_at: string
          expected_salary: string | null
          experience_years: number | null
          id: string
          job_posting_id: string | null
          linkedin_url: string | null
          notes: string | null
          portfolio_url: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applicant_current_company?: string | null
          applicant_current_role?: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          availability?: string | null
          cover_letter?: string | null
          created_at?: string
          expected_salary?: string | null
          experience_years?: number | null
          id?: string
          job_posting_id?: string | null
          linkedin_url?: string | null
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applicant_current_company?: string | null
          applicant_current_role?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          availability?: string | null
          cover_letter?: string | null
          created_at?: string
          expected_salary?: string | null
          experience_years?: number | null
          id?: string
          job_posting_id?: string | null
          linkedin_url?: string | null
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string
          department: string
          description: string | null
          employment_type: string | null
          id: string
          is_active: boolean | null
          location: string | null
          posted_by: string | null
          requirements: Json | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department: string
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: Json | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          posted_by?: string | null
          requirements?: Json | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendees: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          meeting_date: string
          meeting_link: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_date: string
          meeting_link?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_date?: string
          meeting_link?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          posted_by: string | null
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          posted_by?: string | null
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          posted_by?: string | null
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          order_status: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          shipped_at: string | null
          shipping_address: string | null
          total_amount: number
          tracking_number: string | null
          tracking_provider: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_status?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          total_amount: number
          tracking_number?: string | null
          tracking_provider?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_status?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          total_amount?: number
          tracking_number?: string | null
          tracking_provider?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          created_at: string
          hero_icon: string | null
          id: string
          is_active: boolean | null
          page_key: string
          page_subtitle: string | null
          page_title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          hero_icon?: string | null
          id?: string
          is_active?: boolean | null
          page_key: string
          page_subtitle?: string | null
          page_title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          hero_icon?: string | null
          id?: string
          is_active?: boolean | null
          page_key?: string
          page_subtitle?: string | null
          page_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          gallery_images: Json | null
          gallery_videos: Json | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          price: number
          rating: number | null
          specs: Json | null
          stock_status: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          price: number
          rating?: number | null
          specs?: Json | null
          stock_status?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          price?: number
          rating?: number | null
          specs?: Json | null
          stock_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          project_id: string
          role: string | null
          team_member_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          project_id: string
          role?: string | null
          team_member_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          project_id?: string
          role?: string | null
          team_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members_public"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          gallery_images: Json | null
          gallery_videos: Json | null
          id: string
          image_url: string | null
          impact: string | null
          launch_date: string | null
          progress_percentage: number | null
          status: string | null
          tagline: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          impact?: string | null
          launch_date?: string | null
          progress_percentage?: number | null
          status?: string | null
          tagline?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          gallery_images?: Json | null
          gallery_videos?: Json | null
          id?: string
          image_url?: string | null
          impact?: string | null
          launch_date?: string | null
          progress_percentage?: number | null
          status?: string | null
          tagline?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      salary_requests: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          id: string
          month: string
          notes: string | null
          paid_at: string | null
          requested_by: string
          status: string | null
          team_member_id: string
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          approved_by?: string | null
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          paid_at?: string | null
          requested_by: string
          status?: string | null
          team_member_id: string
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          paid_at?: string | null
          requested_by?: string
          status?: string | null
          team_member_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_requests_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_requests_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_campaigns: {
        Row: {
          applies_to: string | null
          banner_color: string | null
          banner_message: string | null
          created_at: string
          created_by: string | null
          current_orders: number | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_orders: number | null
          min_order_amount: number | null
          name: string
          start_date: string
          target_categories: Json | null
          target_product_ids: Json | null
          updated_at: string
        }
        Insert: {
          applies_to?: string | null
          banner_color?: string | null
          banner_message?: string | null
          created_at?: string
          created_by?: string | null
          current_orders?: number | null
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_orders?: number | null
          min_order_amount?: number | null
          name: string
          start_date?: string
          target_categories?: Json | null
          target_product_ids?: Json | null
          updated_at?: string
        }
        Update: {
          applies_to?: string | null
          banner_color?: string | null
          banner_message?: string | null
          created_at?: string
          created_by?: string | null
          current_orders?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_orders?: number | null
          min_order_amount?: number | null
          name?: string
          start_date?: string
          target_categories?: Json | null
          target_product_ids?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          key: string
          label: string
          suffix: string | null
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          key: string
          label: string
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          key?: string
          label?: string
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bonus: number | null
          created_at: string
          department: string | null
          designation: string | null
          email: string
          hired_at: string | null
          id: string
          is_core_pillar: boolean | null
          last_seen: string | null
          login_path: string | null
          name: string
          permissions: Json | null
          phone: string | null
          profile_image: string | null
          role: string
          salary: number | null
          serial_number: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bonus?: number | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          hired_at?: string | null
          id?: string
          is_core_pillar?: boolean | null
          last_seen?: string | null
          login_path?: string | null
          name: string
          permissions?: Json | null
          phone?: string | null
          profile_image?: string | null
          role: string
          salary?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bonus?: number | null
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          hired_at?: string | null
          id?: string
          is_core_pillar?: boolean | null
          last_seen?: string | null
          login_path?: string | null
          name?: string
          permissions?: Json | null
          phone?: string | null
          profile_image?: string | null
          role?: string
          salary?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes_hash: string[] | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          totp_secret_encrypted: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes_hash?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          totp_secret_encrypted: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes_hash?: string[] | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          totp_secret_encrypted?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string | null
          phone: string | null
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          phone?: string | null
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_passkeys: {
        Row: {
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          admin_verified_at: string | null
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_admin_verified: boolean | null
          last_active_at: string | null
          session_token_hash: string
          user_id: string
        }
        Insert: {
          admin_verified_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_admin_verified?: boolean | null
          last_active_at?: string | null
          session_token_hash: string
          user_id: string
        }
        Update: {
          admin_verified_at?: string | null
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_admin_verified?: boolean | null
          last_active_at?: string | null
          session_token_hash?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      team_members_public: {
        Row: {
          created_at: string | null
          department: string | null
          designation: string | null
          hired_at: string | null
          id: string | null
          is_core_pillar: boolean | null
          name: string | null
          profile_image: string | null
          role: string | null
          serial_number: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          hired_at?: string | null
          id?: string | null
          is_core_pillar?: boolean | null
          name?: string | null
          profile_image?: string | null
          role?: string | null
          serial_number?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          designation?: string | null
          hired_at?: string | null
          id?: string | null
          is_core_pillar?: boolean | null
          name?: string | null
          profile_image?: string | null
          role?: string | null
          serial_number?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_type: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      log_auth_attempt: {
        Args: {
          p_attempt_type: string
          p_identifier: string
          p_ip_address?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "developer"
        | "employee"
        | "core_member"
        | "user"
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
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "developer",
        "employee",
        "core_member",
        "user",
      ],
    },
  },
} as const
