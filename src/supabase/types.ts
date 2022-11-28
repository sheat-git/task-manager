export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tags: {
        Row: {
          user_id: string
          color: number | null
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          user_id: string
          color?: number | null
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          color?: number | null
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      "task-tag-relation": {
        Row: {
          user_id: string
          task_id: string
          tag_id: string
          id: string
        }
        Insert: {
          user_id: string
          task_id: string
          tag_id: string
          id?: string
        }
        Update: {
          user_id?: string
          task_id?: string
          tag_id?: string
          id?: string
        }
      }
      tasks: {
        Row: {
          user_id: string
          finished_at: string | null
          expired_at: string | null
          priority: number
          id: string
          title: string
          content: string
          done: boolean
          created_at: string
          modified_at: string
        }
        Insert: {
          user_id: string
          finished_at?: string | null
          expired_at?: string | null
          priority?: number
          id?: string
          title?: string
          content?: string
          done?: boolean
          created_at?: string
          modified_at?: string
        }
        Update: {
          user_id?: string
          finished_at?: string | null
          expired_at?: string | null
          priority?: number
          id?: string
          title?: string
          content?: string
          done?: boolean
          created_at?: string
          modified_at?: string
        }
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
  }
}

