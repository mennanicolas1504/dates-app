import { Typography, type TypographyProps } from "@/components/common/typography"

type PageTitleProps = Omit<TypographyProps, "variant">

/**
 * Título padrão de página — mesmo texto/estilo em qualquer contexto que precise
 * apenas do título (ex.: dentro de um Sheet), sem o layout completo do PageHeader.
 */
export function PageTitle({ as = "h1", ...props }: PageTitleProps) {
  return <Typography variant="heading" as={as} {...props} />
}
