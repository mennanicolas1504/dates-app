/**
 * Um convite pode ser aberto por alguém que ainda não tem conta — o token
 * precisa sobreviver ao cadastro/login sem passar por query param entre
 * redirects (evitaria mexer em `RequireAuth`/login/cadastro). `sessionStorage`
 * resolve isso: grava o token assim que `/convite/:token` monta, e
 * `OnboardingWelcomePage` (onde todo usuário sem espaço aterrissa depois de
 * autenticar) confere e resgata sozinho.
 */
const STORAGE_KEY = "dates:pending-invite-token"

export function setPendingInviteToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token)
}

export function getPendingInviteToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY)
}

export function clearPendingInviteToken(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
