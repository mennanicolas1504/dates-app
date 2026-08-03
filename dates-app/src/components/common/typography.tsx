import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl",
      heading: "text-2xl leading-tight font-semibold tracking-tight md:text-3xl",
      title: "text-lg leading-snug font-semibold",
      subtitle: "text-base leading-normal font-medium text-muted-foreground",
      body: "text-sm leading-relaxed font-normal",
      caption: "text-xs leading-normal font-normal text-muted-foreground",
      label: "text-xs leading-none font-medium tracking-wide text-muted-foreground uppercase",
    },
  },
  defaultVariants: {
    variant: "body",
  },
})

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>

const defaultElement: Record<TypographyVariant, React.ElementType> = {
  display: "h1",
  heading: "h2",
  title: "h3",
  subtitle: "p",
  body: "p",
  caption: "span",
  label: "span",
}

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

export function Typography({
  variant = "body",
  as,
  className,
  ...props
}: TypographyProps) {
  const resolvedVariant = variant ?? "body"
  const Comp = as ?? defaultElement[resolvedVariant]

  return (
    <Comp
      className={cn(typographyVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  )
}

export { typographyVariants }
export type { TypographyProps, TypographyVariant }
