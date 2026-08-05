import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Coluna central, não uma grade larga de dashboard (Fase 15: o app deve
 * parecer um aplicativo mobile em qualquer tamanho de tela, não um site).
 * `max-w-2xl` é a mesma largura confortável de leitura de um app de
 * celular, só que centralizada — mesmo em telas grandes.
 */
export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-2xl px-4 py-5 sm:px-6", className)}
      {...props}
    />
  )
}
