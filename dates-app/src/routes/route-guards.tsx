import { Navigate, Outlet } from "react-router-dom"

import { Loading } from "@/components/common/loading"
import { useAuth } from "@/providers/auth-provider"
import { paths } from "@/routes/paths"

/**
 * Rotas que `RequireOnboardingIncomplete` de fato protege — usado só para o
 * workaround de `window.location` abaixo, não para roteamento em si.
 */
const ONBOARDING_INCOMPLETE_PATHS: string[] = [
  paths.onboarding,
  paths.onboardingCreateSpace,
  paths.onboardingJoinSpace,
]

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

/**
 * Dentro de RequireAuth: só deixa passar quem AINDA NÃO terminou o
 * onboarding.
 *
 * Achado na Fase 21 (bug conhecido desde a Fase 20): criar o espaço e
 * revelar o convite mudam `onboardingCompleted` (via `setSpace`) e navegam
 * (`navigate(paths.onboardingShareInvite)`) na mesma leva de atualizações.
 * Diagnosticado com logs: nesse instante exato, `window.location.pathname`
 * já é `/onboarding/convidar` (o `history` real já mudou, síncrono), mas
 * `useLocation()` do React Router ainda reporta o pathname antigo
 * (`/onboarding/criar-espaco`) — o estado reativo dele atrasa uma
 * renderização em relação ao `history`. Usar `useLocation()` aqui faria
 * este guard achar, por essa única renderização, que ainda estamos numa
 * rota que ele protege, e redirecionar para a Home — vencendo a navegação
 * de verdade para a tela de convite. `window.location`, sendo a API nativa
 * do browser, nunca fica atrasada; checar contra ela evita esse falso
 * positivo sem depender de timing/batching do React.
 */
export function RequireOnboardingIncomplete() {
  const { onboardingCompleted } = useAuth()

  if (onboardingCompleted && ONBOARDING_INCOMPLETE_PATHS.includes(window.location.pathname)) {
    return <Navigate to={paths.home} replace />
  }

  return <Outlet />
}

/** Dentro de RequireAuth: só deixa passar quem JÁ terminou o onboarding. */
export function RequireOnboardingComplete() {
  const { onboardingCompleted } = useAuth()

  if (!onboardingCompleted) return <Navigate to={paths.onboarding} replace />

  return <Outlet />
}
