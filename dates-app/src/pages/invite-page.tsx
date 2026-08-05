import { useParams } from "react-router-dom"

import { AuthLayout } from "@/features/auth/components/auth-layout"
import { InviteRedeemer } from "@/features/invites/components/invite-redeemer"

export function InvitePage() {
  const { token } = useParams<{ token: string }>()

  return (
    <AuthLayout title="Convite">
      {token ? (
        <InviteRedeemer token={token} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">Link de convite inválido.</p>
      )}
    </AuthLayout>
  )
}
