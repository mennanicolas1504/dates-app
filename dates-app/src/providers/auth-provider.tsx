import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"

import {
  buildCreateSpaceMetadata,
  getSpaceFromUser,
  isOnboardingCompleted,
} from "@/features/space/types"
import type { Space } from "@/features/space/types"
import { supabase } from "@/lib/supabase"
import { paths } from "@/routes/paths"

interface AuthActionResult {
  error: string | null
}

interface SignUpResult extends AuthActionResult {
  /** true quando o Supabase exige confirmação por e-mail antes do primeiro login. */
  needsEmailConfirmation: boolean
}

interface AuthContextValue {
  user: User | null
  /** O espaço do usuário — ver `features/space/types.ts`. `null` até o onboarding terminar. */
  space: Space | null
  onboardingCompleted: boolean
  /** true enquanto a sessão inicial ainda está sendo verificada. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthActionResult>
  updatePassword: (password: string) => Promise<AuthActionResult>
  /** Cria o espaço e marca o onboarding como concluído (ver features/space/types.ts). */
  createSpace: (name: string) => Promise<AuthActionResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      space: getSpaceFromUser(user),
      onboardingCompleted: isOnboardingCompleted(user),
      loading,

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },

      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password })
        return {
          error: error?.message ?? null,
          needsEmailConfirmation: !error && data.user !== null && data.session === null,
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
      },

      requestPasswordReset: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${paths.resetPassword}`,
        })
        return { error: error?.message ?? null }
      },

      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password })
        return { error: error?.message ?? null }
      },

      createSpace: async (name) => {
        const { error } = await supabase.auth.updateUser({
          data: buildCreateSpaceMetadata(name),
        })
        return { error: error?.message ?? null }
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
