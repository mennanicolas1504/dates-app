import type { Tables } from "@/types/database"

export interface Profile {
  id: string
  email: string
  displayName?: string
  /** ISO date string. */
  createdAt: string
}

export function mapProfileRow(row: Tables<"profiles">): Profile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name ?? undefined,
    createdAt: row.created_at,
  }
}
