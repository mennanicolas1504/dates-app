/** Nome de exibição de um perfil — primeiro nome escolhido, senão o usuário do e-mail. */
export function profileDisplayName(profile: { email: string; display_name: string | null }): string {
  return profile.display_name ?? profile.email.split("@")[0]
}
