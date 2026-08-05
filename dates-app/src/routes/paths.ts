export const paths = {
  home: "/",
  ideias: "/ideias",
  album: "/album",
  spaceSettings: "/espaco",
  profile: "/perfil",

  login: "/entrar",
  signup: "/cadastro",
  forgotPassword: "/esqueci-senha",
  resetPassword: "/redefinir-senha",
  authConfirm: "/auth/confirmar",

  onboarding: "/onboarding",
  onboardingCreateSpace: "/onboarding/criar-espaco",
  onboardingJoinSpace: "/onboarding/convite",
  /**
   * Fora do `RequireOnboardingIncomplete` de propósito (ver router.tsx):
   * assim que o espaço é criado, `onboardingCompleted` vira `true` e esse
   * guard redirecionaria pra Home antes do usuário ver o link — a revelação
   * do convite precisa ficar numa rota que não seja re-avaliada por ele.
   */
  onboardingShareInvite: "/onboarding/convidar",

  /** Rota pública — recebe :token. Ver `buildInviteUrl` para montar o link real. */
  invite: "/convite/:token",
} as const
