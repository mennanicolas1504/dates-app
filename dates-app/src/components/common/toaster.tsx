import { AnimatePresence, motion } from "framer-motion"

import { Toast } from "@/components/common/toast"
import { useToast } from "@/hooks/use-toast"
import { transition } from "@/lib/motion"

/**
 * Renderiza a pilha de toasts ativos. Deve ser montado uma única vez,
 * próximo à raiz da aplicação (ver relatório desta fase — ainda não
 * foi conectado a `src/app/App.tsx` por estar fora do escopo desta etapa).
 */
export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={transition}
            className="pointer-events-auto"
          >
            <Toast toast={item} onDismiss={dismiss} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
