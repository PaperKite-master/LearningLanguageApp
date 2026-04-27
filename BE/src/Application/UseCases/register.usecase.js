import { signUp } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Register a new user via Supabase Auth and save profile.
 * Sends OTP to user's email if Email Confirm is enabled.
 */
export async function registerUseCase(prisma, { email, password, fullName, role }) {
  // Call standard signup
  const data = await signUp(email, password);
  
  // Depending on Supabase settings, data.user might be present even if unconfirmed
  const userId = data.user?.id;

  if (userId) {
    // Upsert profile in public.profiles. We can set default Role here.
    const userRole = role ? role.toUpperCase() : 'USER';
    await prisma.profiles.upsert({
      where: { id: userId },
      update: { full_name: fullName ?? null, role: userRole },
      create: {
        id: userId,
        full_name: fullName ?? null,
        role: userRole,
      },
    });
  }

  return {
    id: data.user?.id || null,
    email: data.user?.email || email,
    message: 'Register successful. Please check your email for the verification code.',
  };
}
