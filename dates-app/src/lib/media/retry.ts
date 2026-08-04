/**
 * Retry com backoff simples — só para a chamada de rede do upload em si
 * (`storage.upload`, ver `api.ts`). Nunca usado para validação ou para o
 * insert na tabela `media`: falha de validação é permanente (tentar de novo
 * não muda o resultado), e um insert que falha depois de um upload
 * bem-sucedido já tem tratamento próprio (rollback do arquivo — ver
 * `uploadMedia`), repetir o insert cegamente arriscaria duplicar a linha.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delayMs = 400,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }

  throw lastError
}
