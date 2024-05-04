export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      book_origins: {
        Row: {
          author_nationality_lat: string | null
          author_nationality_long: string | null
          country_published_lat: string | null
          country_published_long: string | null
          created_at: string
          id: string
          setting_origin_lat: string | null
          setting_origin_long: string | null
          user_book: string | null
        }
        Insert: {
          author_nationality_lat?: string | null
          author_nationality_long?: string | null
          country_published_lat?: string | null
          country_published_long?: string | null
          created_at?: string
          id?: string
          setting_origin_lat?: string | null
          setting_origin_long?: string | null
          user_book?: string | null
        }
        Update: {
          author_nationality_lat?: string | null
          author_nationality_long?: string | null
          country_published_lat?: string | null
          country_published_long?: string | null
          created_at?: string
          id?: string
          setting_origin_lat?: string | null
          setting_origin_long?: string | null
          user_book?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_origins_user_book_fkey"
            columns: ["user_book"]
            isOneToOne: false
            referencedRelation: "users_books"
            referencedColumns: ["id"]
          }
        ]
      }
      book_tags: {
        Row: {
          book: string | null
          created_at: string
          id: string
          tag: string | null
        }
        Insert: {
          book?: string | null
          created_at?: string
          id?: string
          tag?: string | null
        }
        Update: {
          book?: string | null
          created_at?: string
          id?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_tags_book_fkey"
            columns: ["book"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_tags_tag_fkey"
            columns: ["tag"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      books: {
        Row: {
          cover_url: string | null
          created_at: string
          google_api_data: Json | null
          id: string
          isbn_10: string | null
          isbn_13: string | null
          title: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          google_api_data?: Json | null
          id?: string
          isbn_10?: string | null
          isbn_13?: string | null
          title?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          google_api_data?: Json | null
          id?: string
          isbn_10?: string | null
          isbn_13?: string | null
          title?: string | null
        }
        Relationships: []
      }
      goal_logs: {
        Row: {
          created_at: string
          goal: string | null
          id: string
          type: string | null
          unit_amount: number | null
          user: string | null
        }
        Insert: {
          created_at?: string
          goal?: string | null
          id?: string
          type?: string | null
          unit_amount?: number | null
          user?: string | null
        }
        Update: {
          created_at?: string
          goal?: string | null
          id?: string
          type?: string | null
          unit_amount?: number | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_logs_goal_fkey"
            columns: ["goal"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_logs_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          created_at: string
          id: string
          time_type: string | null
          type: string | null
          unit_amount: number | null
          user: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          time_type?: string | null
          type?: string | null
          unit_amount?: number | null
          user?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          time_type?: string | null
          type?: string | null
          unit_amount?: number | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_colors: {
        Row: {
          color_code: string | null
          created_at: string
          description: string | null
          habit: string | null
          id: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          habit?: string | null
          id?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          description?: string | null
          habit?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_colors_habit_fkey"
            columns: ["habit"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_logs: {
        Row: {
          created_at: string
          habit_color: string | null
          id: string
        }
        Insert: {
          created_at?: string
          habit_color?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          habit_color?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_color_fkey"
            columns: ["habit_color"]
            isOneToOne: false
            referencedRelation: "habit_colors"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          created_at: string
          id: string
          name: string | null
          user: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          user?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string | null
          users_book: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          users_book?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string | null
          users_book?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journals_users_book_fkey"
            columns: ["users_book"]
            isOneToOne: false
            referencedRelation: "users_books"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          title: string | null
          user: string | null
          users_book: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          user?: string | null
          users_book?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          user?: string | null
          users_book?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_users_book_fkey"
            columns: ["users_book"]
            isOneToOne: false
            referencedRelation: "users_books"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          author: string | null
          created_at: string
          id: string
          liked: boolean | null
          title: string | null
          users_book: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          liked?: boolean | null
          title?: string | null
          users_book?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          liked?: boolean | null
          title?: string | null
          users_book?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_users_book_fkey"
            columns: ["users_book"]
            isOneToOne: false
            referencedRelation: "users_books"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          billing_address: Json | null
          created_at: string | null
          full_name: string | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          avatar_url?: string | null
          billing_address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: []
      }
      users_books: {
        Row: {
          book: string | null
          created_at: string
          id: string
          status: string | null
          user: string | null
        }
        Insert: {
          book?: string | null
          created_at?: string
          id?: string
          status?: string | null
          user?: string | null
        }
        Update: {
          book?: string | null
          created_at?: string
          id?: string
          status?: string | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_books_book_fkey"
            columns: ["book"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_books_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

