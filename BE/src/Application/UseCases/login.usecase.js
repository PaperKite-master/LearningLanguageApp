import { signInWithPassword } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Login use case - authenticate via Supabase and return tokens + profile.
 */
export async function loginUseCase(prisma, { email, password }) {
  const data = await signInWithPassword(email, password);

  const userId = data.user?.id;
  let profile = null;

  if (userId) {
    profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { full_name: true, role: true, avatar_url: true, total_exp: true },
    });
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    user: {
      id: data.user?.id,
      email: data.user?.email,
      role: profile?.role ?? 'USER',
      fullName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      totalExp: profile?.total_exp ?? 0,
    },
  };
}
