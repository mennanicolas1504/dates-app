import { createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { HomePage } from "@/pages/home-page"
import { IdeiasPage } from "@/pages/ideias-page"
import { LoginPage } from "@/pages/login-page"
import { OnboardingCreateSpacePage } from "@/pages/onboarding-create-space-page"
import { OnboardingJoinSpacePage } from "@/pages/onboarding-join-space-page"
import { OnboardingWelcomePage } from "@/pages/onboarding-welcome-page"
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
      {
        element: <RequireOnboardingComplete />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: paths.home, element: <HomePage /> },
              { path: paths.ideias, element: <IdeiasPage /> },
              { path: paths.spaceSettings, element: <SpaceSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
