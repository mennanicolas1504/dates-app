/**
 * Converte uma chamada de rede que nunca resolve nem rejeita (conexão
 * travada — wifi fraco, troca de torre no celular, proxy que derruba
 * silenciosamente) num erro de verdade, que a UI já sabe tratar. Nenhum SDK
 * usado aqui tem timeout embutido: nem `fetch` nativo, nem
 * `@supabase/storage-js`, nem `@supabase/postgrest-js` (auditoria da Fase
 * 23) — sem isto, uma `Promise` que trava deixa `uploading`/`removing`
 * presos em `true` para sempre, sem erro, sem recuperação.
 *
 * Não substitui `withRetry` (que trata rejeição explícita, com backoff);
 * resolve o caso que ele não cobre — a `Promise` que nunca se resolve.
 */
export async function withTimeout<T>(fn: () => PromiseLike<T>, ms = 20000): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error("Tempo esgotado. Verifique sua conexão e tente novamente.")),
        ms,
      )
    }),
  ])
}
