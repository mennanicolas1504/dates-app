/**
 * Tipos gerados a partir de `supabase/migrations/`. Formato compatível com
 * a saída de `supabase gen types typescript` (mesma forma de `Database`,
 * `Tables<>`, etc.) para que o comando oficial possa substituir este
 * arquivo sem quebrar nenhum import, assim que houver um projeto Supabase
 * real para apontar (`supabase gen types typescript --project-id <id>`).
 *
 * Escrito à mão nesta fase porque não há Docker disponível neste ambiente
 * para rodar Supabase localmente e gerar isto a partir de um Postgres de
 * verdade — mantenha em sincronia manual com as migrations até lá.
 *
 * Ainda não consumido pela aplicação (ver `src/lib/supabase.ts` — a troca
 * de `user_metadata` para estas tabelas é a próxima fase).
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ExperienceStatus = "idea" | "scheduled" | "completed"
export type SpaceMemberRole = "owner" | "member"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      space_members: {
        Row: {
          space_id: string
          profile_id: string
          role: SpaceMemberRole
          joined_at: string
        }
        Insert: {
          space_id: string
          profile_id: string
          role?: SpaceMemberRole
          joined_at?: string
        }
        Update: {
          space_id?: string
          profile_id?: string
          role?: SpaceMemberRole
          joined_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          space_id: string
          title: string
          category: string
          status: ExperienceStatus
          favorite: boolean
          created_by_id: string | null
          created_at: string
          updated_at: string
          description: string | null
          location: string | null
          instagram: string | null
          website: string | null
          link: string | null
          city: string | null
          notes: string | null
          scheduled_date: string | null
          completed_at: string | null
          rating: number | null
        }
        Insert: {
          id?: string
          space_id: string
          title: string
          category: string
          status?: ExperienceStatus
          favorite?: boolean
          created_by_id?: string | null
          created_at?: string
          updated_at?: string
          description?: string | null
          location?: string | null
          instagram?: string | null
          website?: string | null
          link?: string | null
          city?: string | null
          notes?: string | null
          scheduled_date?: string | null
          completed_at?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          space_id?: string
          title?: string
          category?: string
          status?: ExperienceStatus
          favorite?: boolean
          created_by_id?: string | null
          created_at?: string
          updated_at?: string
          description?: string | null
          location?: string | null
          instagram?: string | null
          website?: string | null
          link?: string | null
          city?: string | null
          notes?: string | null
          scheduled_date?: string | null
          completed_at?: string | null
          rating?: number | null
        }
      }
      experience_images: {
        Row: {
          id: string
          experience_id: string
          storage_path: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          storage_path: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          storage_path?: string
          position?: number
          created_at?: string
        }
      }
    }
    Functions: {
      is_space_member: {
        Args: { target_space_id: string }
        Returns: boolean
      }
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
