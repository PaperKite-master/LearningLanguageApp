import { signInWithPassword } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Login use case - authenticate via Supabase and return tokens + profile.
 */
function mapLoginError(error) {
  const message = String(error.message || '');
  const code = error.data?.error_code || error.data?.code || '';

  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    const err = new Error('Email chưa được xác thực. Vui lòng hoàn tất bước OTP trong email đăng ký.');
    err.statusCode = 403;
    throw err;
  }

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.statusCode = 401;
    throw err;
  }

  throw error;
}

export async function loginUseCase(prisma, { email, password }) {
  let data;
  try {
    data = await signInWithPassword(email, password);
  } catch (error) {
    mapLoginError(error);
  }

  const userId = data.user?.id;
  let profile = null;

  if (userId) {
    profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { full_name: true, role: true, avatar_url: true, total_exp: true, target_level: true },
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
      targetLevel: profile?.target_level ?? 'N5',
    },
  };
}
