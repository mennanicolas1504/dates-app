import { createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { AlbumPage } from "@/pages/album-page"
import { AuthConfirmPage } from "@/pages/auth-confirm-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { HomePage } from "@/pages/home-page"
import { IdeiasPage } from "@/pages/ideias-page"
import { InvitePage } from "@/pages/invite-page"
import { LoginPage } from "@/pages/login-page"
import { NotificationsPage } from "@/pages/notifications-page"
import { OnboardingCreateSpacePage } from "@/pages/onboarding-create-space-page"
import { OnboardingJoinSpacePage } from "@/pages/onboarding-join-space-page"
import { OnboardingShareInvitePage } from "@/pages/onboarding-share-invite-page"
import { OnboardingWelcomePage } from "@/pages/onboarding-welcome-page"
import { ProfilePage } from "@/pages/profile-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"
import { SignupPage } from "@/pages/signup-page"
import { SpaceSettingsPage } from "@/pages/space-settings-page"
import { paths } from "@/routes/paths"
import {
  RequireAuth,
  RequireGuest,
  RequireOnboardingComplete,
  RequireOnboardingIncomplete,
} from "@/routes/route-guards"

export const router = createBrowserRouter([
  // Só acessível sem sessão — login, cadastro, recuperação de senha.
  {
    element: <RequireGuest />,
    children: [
      { path: paths.login, element: <LoginPage /> },
      { path: paths.signup, element: <SignupPage /> },
      { path: paths.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },

  // Fora do RequireGuest de propósito: o link do e-mail cria uma sessão de
  // recuperação (o usuário já tem `user` setado nesse momento).
  { path: paths.resetPassword, element: <ResetPasswordPage /> },

  // Fora do RequireGuest/RequireAuth de propósito: antes do verifyOtp
  // resolver não existe sessão ainda, então nenhum dos dois guards se aplica.
  { path: paths.authConfirm, element: <AuthConfirmPage /> },

  // Fora dos dois guards de propósito: quem clica no link pode não ter
  // conta ainda. A própria página decide o que mostrar conforme o estado
  // de autenticação (ver `pages/invite-page.tsx`).
  { path: paths.invite, element: <InvitePage /> },

  // A partir daqui, exige sessão.
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireOnboardingIncomplete />,
        children: [
          { path: paths.onboarding, element: <OnboardingWelcomePage /> },
          { path: paths.onboardingCreateSpace, element: <OnboardingCreateSpacePage /> },
          { path: paths.onboardingJoinSpace, element: <OnboardingJoinSpacePage /> },
        ],
      },

      // Fora do RequireOnboardingIncomplete de propósito — ver comentário em
      // `routes/paths.ts` sobre `onboardingShareInvite`.
      { path: paths.onboardingShareInvite, element: <OnboardingShareInvitePage /> },

      {
        element: <RequireOnboardingComplete />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: paths.home, element: <HomePage /> },
              { path: paths.ideias, element: <IdeiasPage /> },
              { path: paths.album, element: <AlbumPage /> },
              { path: paths.spaceSettings, element: <SpaceSettingsPage /> },
              { path: paths.profile, element: <ProfilePage /> },
              { path: paths.notifications, element: <NotificationsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
