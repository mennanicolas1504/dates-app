import { Navigate, Outlet } from "react-router-dom"

import { Loading } from "@/components/common/loading"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

function FullScreenLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loading label="Carregando..." />
    </div>
  )
}

/** Só deixa passar quem está autenticado — senão, manda para o login. */
export function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoading />
  if (!user) return <Navigate to={paths.login} replace />

  return <Outlet />
}

/** Só deixa passar quem NÃO está autenticado (telas de login/cadastro/senha). */
export function RequireGuest() {
  const { user, loading } = useAuth()

  if (loading) return <FullScreenLoading />
  if (user) return <Navigate to={paths.home} replace />

  return <Outlet />
}

/** Dentro de RequireAuth: só deixa passar quem AINDA NÃO terminou o onboarding. */
export function RequireOnboardingIncomplete() {
  const { onboardingCompleted } = useAuth()

  if (onboardingCompleted) return <Navigate to={paths.home} replace />

  return <Outlet />
}

/** Dentro de RequireAuth: só deixa passar quem JÁ terminou o onboarding. */
export function RequireOnboardingComplete() {
  const { onboardingCompleted } = useAuth()

  if (!onboardingCompleted) return <Navigate to={paths.onboarding} replace />

  return <Outlet />
}
