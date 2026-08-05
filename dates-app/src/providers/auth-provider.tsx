import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"

import {
  createSpace as createSpaceInDb,
  fetchSpaceForUser,
  updateSpaceName as updateSpaceNameInDb,
} from "@/features/space/api"
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
  /** true quando existe pelo menos uma membership do usuário em `space_members`. */
  onboardingCompleted: boolean
  /** true enquanto a sessão inicial ou o espaço ainda estão sendo carregados. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthActionResult>
  updatePassword: (password: string) => Promise<AuthActionResult>
  /** Cria o espaço (spaces + space_members), guarda no estado local e devolve o registro criado. */
  createSpace: (name: string) => Promise<AuthActionResult & { space: Space | null }>
  /** Atualiza o nome do espaço atual no banco e reflete o resultado localmente. */
  updateSpaceName: (name: string) => Promise<AuthActionResult>
  /**
   * Rebusca o espaço do usuário atual e atualiza o estado local — para
   * quando a membership muda por um caminho que não passa por `createSpace`
   * (ex: entrar via convite, ver `features/invites/`).
   */
  refreshSpace: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [space, setSpace] = useState<Space | null>(null)
  const [spaceLoading, setSpaceLoading] = useState(true)
  // `undefined` = "ainda não comparamos" (distinto de `null` = "comparamos
  // e não há usuário logado"). Sem essa distinção de 3 estados, montar já
  // deslogado (currentUserId null, estado inicial também null) nunca dispara
  // o branch abaixo, e `spaceLoading` fica preso em `true` para sempre.
  const [spaceUserId, setSpaceUserId] = useState<string | null | undefined>(undefined)

  const user = session?.user ?? null

  // Reseta o espaço em render (não em efeito) sempre que o usuário logado
  // muda de identidade — evita "setState síncrono dentro de efeito" para o
  // caso de logout/troca de conta. O efeito abaixo só dispara a busca
  // assíncrona propriamente dita.
  //
  // `user?.id` é `undefined` quando deslogado; normalizar para `null` (não
  // `undefined`) antes de comparar é essencial para não confundir esse valor
  // com o sentinel "ainda não comparamos" acima.
  const currentUserId = user?.id ?? null
  if (currentUserId !== spaceUserId) {
    setSpaceUserId(currentUserId)
    setSpace(null)
    setSpaceLoading(currentUserId !== null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // O espaço não vem mais de user_metadata (síncrono) — precisa de uma
  // consulta própria a `space_members`/`spaces`, refeita sempre que o
  // usuário logado muda (login, logout, troca de conta).
  useEffect(() => {
    if (!user) return

    let cancelled = false

    fetchSpaceForUser(user.id).then(({ space: fetchedSpace }) => {
      if (!cancelled) {
        setSpace(fetchedSpace)
        setSpaceLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      space,
      onboardingCompleted: space !== null,
      loading: sessionLoading || spaceLoading,

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
        if (!user) return { error: "Sessão inválida.", space: null }

        const { space: createdSpace, error } = await createSpaceInDb(name, user.id)
        if (error) return { error, space: null }

        setSpace(createdSpace)
        return { error: null, space: createdSpace }
      },

      updateSpaceName: async (name) => {
        if (!space) return { error: "Nenhum espaço para atualizar." }

        const { error } = await updateSpaceNameInDb(space.id, name)
        if (error) return { error }

        setSpace({ ...space, name })
        return { error: null }
      },

      refreshSpace: async () => {
        if (!user) return
        const { space: fetchedSpace } = await fetchSpaceForUser(user.id)
        setSpace(fetchedSpace)
      },
    }),
    [user, space, sessionLoading, spaceLoading],
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
