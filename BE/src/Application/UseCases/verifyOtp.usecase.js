import {
  confirmUserEmailAdmin,
  signInWithPassword,
  verifyOtp as supabaseVerifyOtp,
} from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Verify OTP for signup (Gmail/custom DB) or recovery (Supabase).
 */
export async function verifyOtpUseCase(prisma, { email, token, type, password }) {
  if (type === 'signup') {
    const otpRecord = await prisma.otp_codes.findFirst({
      where: {
        email,
        code: token,
        used: false,
        expires_at: { gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      const err = new Error('Mã xác thực OTP không chính xác hoặc đã hết hạn.');
      err.statusCode = 400;
      throw err;
    }

    if (!password) {
      const err = new Error('Thiếu mật khẩu để hoàn tất đăng ký.');
      err.statusCode = 400;
      throw err;
    }

    await prisma.otp_codes.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const authUser = await prisma.users.findFirst({
      where: { email },
      select: { id: true },
    });

    if (!authUser?.id) {
      const err = new Error('Không tìm thấy tài khoản. Vui lòng đăng ký lại.');
      err.statusCode = 404;
      throw err;
    }

    await confirmUserEmailAdmin(authUser.id);

    const sessionData = await signInWithPassword(email, password);
    const userId = sessionData.user?.id || authUser.id;

    let profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { full_name: true, role: true, avatar_url: true, total_exp: true, target_level: true },
    });

    if (!profile) {
      profile = await prisma.profiles.create({
        data: {
          id: userId,
          full_name: sessionData.user?.user_metadata?.full_name || email.split('@')[0],
          role: 'USER',
          target_level: 'N5',
        },
      });
    }

    return {
      accessToken: sessionData.access_token,
      refreshToken: sessionData.refresh_token,
      expiresIn: sessionData.expires_in,
      tokenType: sessionData.token_type || 'bearer',
      user: {
        id: userId,
        email: sessionData.user?.email || email,
        role: profile.role ?? 'USER',
        fullName: profile.full_name ?? null,
        avatarUrl: profile.avatar_url ?? null,
        totalExp: profile.total_exp ?? 0,
        targetLevel: profile.target_level ?? 'N5',
      },
      message: 'Xác thực OTP thành công.',
    };
  }

  const supabaseType = type === 'recovery' || type === 'email' ? type : 'recovery';
  const sessionData = await supabaseVerifyOtp(email, token, supabaseType);
  const userId = sessionData.user?.id;

  if (!userId) {
    const err = new Error('Không thể xác thực OTP. Vui lòng thử lại.');
    err.statusCode = 400;
    throw err;
  }

  let profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { full_name: true, role: true, avatar_url: true, total_exp: true, target_level: true },
  });

  if (!profile) {
    profile = await prisma.profiles.create({
      data: {
        id: userId,
        full_name: sessionData.user?.user_metadata?.full_name || email.split('@')[0],
        role: 'USER',
        target_level: 'N5',
      },
    });
  }

  return {
    accessToken: sessionData.access_token,
    refreshToken: sessionData.refresh_token,
    expiresIn: sessionData.expires_in,
    tokenType: sessionData.token_type || 'bearer',
    user: {
      id: userId,
      email: sessionData.user?.email || email,
      role: profile.role ?? 'USER',
      fullName: profile.full_name ?? null,
      avatarUrl: profile.avatar_url ?? null,
      totalExp: profile.total_exp ?? 0,
      targetLevel: profile.target_level ?? 'N5',
    },
    message: 'OTP verified successfully.',
  };
}
