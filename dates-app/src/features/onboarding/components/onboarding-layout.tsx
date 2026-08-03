import { ChevronLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Typography } from "@/components/common/typography"
import { Button } from "@/components/ui/button"

interface OnboardingLayoutProps {
  title: string
  description?: string
  children: ReactNode
  onBack?: () => void
}

/** Mesma base do AuthLayout — coluna única, mobile first, sem chrome de app. */
export function OnboardingLayout({
  title,
  description,
  children,
  onBack,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 w-fit text-muted-foreground"
          >
            <ChevronLeft data-icon="inline-start" />
            Voltar
          </Button>
        )}

        <div className="flex flex-col gap-1 text-center">
          <Typography variant="heading" as="h1" className="text-xl">
            {title}
          </Typography>
          {description && <Typography variant="subtitle">{description}</Typography>}
        </div>

        {children}
      </div>
    </div>
  )
}
