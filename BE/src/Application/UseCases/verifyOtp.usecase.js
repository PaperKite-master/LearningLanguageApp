/**
 * Verify OTP (One Time Password) sent to email for sign-up, login, or recovery.
 * 
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} payload
 * @param {string} payload.email
 * @param {string} payload.token
 * @param {string} payload.type
 */
export async function verifyOtpUseCase(prisma, { email, token, type }) {
  // 1. Verify OTP in our database first
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

  // Mark OTP as used
  await prisma.otp_codes.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  // 2. Check if the user exists in the auth schema
  let user = await prisma.users.findFirst({
    where: { email },
  });

  let userId = user?.id;

  if (!user) {
    // Silently create the user in Supabase Auth via Admin API
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password: randomPassword,
        email_confirm: true,
      }),
    });

    if (!createRes.ok) {
      const errorData = await createRes.json();
      const err = new Error(errorData.msg || errorData.message || 'Không thể khởi tạo tài khoản trên hệ thống.');
      err.statusCode = createRes.status;
      throw err;
    }

    const createdUser = await createRes.json();
    userId = createdUser.id;

    // Create default profile for the new user
    await prisma.profiles.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        full_name: email.split('@')[0],
        role: 'USER',
        target_level: 'N5',
      },
    });
  }

  // 3. Generate a magiclink token silently using Supabase Admin API
  const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      type: 'magiclink',
      email,
    }),
  });

  if (!linkRes.ok) {
    const errorData = await linkRes.json();
    const err = new Error(errorData.msg || errorData.message || 'Không thể tạo mã đăng nhập tự động.');
    err.statusCode = linkRes.status;
    throw err;
  }

  const linkData = await linkRes.json();
  const url = new URL(linkData.action_link);
  const tokenHash = url.searchParams.get('token');
  const verificationType = url.searchParams.get('type') || 'magiclink';

  // 4. Verify the token_hash to obtain the Supabase Auth session
  const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      token_hash: tokenHash,
      type: verificationType,
    }),
  });

  if (!verifyRes.ok) {
    const errorData = await verifyRes.json();
    const err = new Error(errorData.msg || errorData.message || 'Không thể tạo phiên đăng nhập.');
    err.statusCode = verifyRes.status;
    throw err;
  }

  const sessionData = await verifyRes.json();
  const accessToken = sessionData.access_token;
  const refreshToken = sessionData.refresh_token;
  const expiresIn = sessionData.expires_in;
  const tokenType = sessionData.token_type || 'bearer';

  // 5. Load or create user profile
  let profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { full_name: true, role: true, avatar_url: true, total_exp: true, target_level: true },
  });

  if (!profile) {
    profile = await prisma.profiles.create({
      data: {
        id: userId,
        full_name: email.split('@')[0],
        role: 'USER',
        target_level: 'N5',
      },
    });
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType,
    user: {
      id: userId,
      email: sessionData.user?.email || email,
      role: profile.role ?? 'USER',
      fullName: profile.full_name ?? null,
      avatarUrl: profile.avatar_url ?? null,
      totalExp: profile.total_exp ?? 0,
      targetLevel: profile.target_level ?? 'N5',
    },
    message: 'OTP verified successfully. Login successful.',
  };
}
