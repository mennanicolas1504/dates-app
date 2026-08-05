/**
 * Traduz erros do Supabase Auth para mensagens em português — sem isso, o
 * usuário via a mensagem técnica em inglês do GoTrue direto na tela (ex:
 * "Email address is invalid", "Invalid login credentials"), quebrando a
 * consistência de idioma do resto do produto. Cobre os códigos que
 * realistamente aparecem nos fluxos existentes (login, cadastro, recuperar/
 * redefinir senha); qualquer código não mapeado cai num texto genérico em
 * português — nunca mais mostra a string crua do provedor.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_address_invalid: "Este e-mail não é válido.",
  email_exists: "Este e-mail já está cadastrado.",
  user_already_exists: "Este e-mail já está cadastrado.",
  weak_password: "A senha é muito fraca — use pelo menos 6 caracteres.",
  same_password: "A nova senha precisa ser diferente da atual.",
  user_not_found: "Não encontramos uma conta com esse e-mail.",
  over_email_send_rate_limit:
    "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.",
  over_request_rate_limit: "Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.",
}

/** `error` no formato que `supabase-js` devolve (`{ code, message }`) — aceita `null` para simplificar o call site. */
export function translateAuthError(error: { code?: string; message: string } | null): string | null {
  if (!error) return null
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) return AUTH_ERROR_MESSAGES[error.code]
  return "Não foi possível concluir. Tente novamente em instantes."
}
