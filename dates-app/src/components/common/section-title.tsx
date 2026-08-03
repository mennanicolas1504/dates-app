import { Typography, type TypographyProps } from "@/components/common/typography"

type SectionTitleProps = Omit<TypographyProps, "variant">

/**
 * Título padrão de subseção — mesmo texto/estilo do usado internamente pelo
 * Section, disponível isoladamente para contextos que não precisam do wrapper completo.
 */
export function SectionTitle({ as = "h2", ...props }: SectionTitleProps) {
  return <Typography variant="title" as={as} {...props} />
}
