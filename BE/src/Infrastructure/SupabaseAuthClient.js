// Wrapper for Supabase Auth REST API
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function supabaseRequest(path, body = null, method = 'POST', customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...customHeaders,
  };
  
  // Default to Authorization Bearer with ANON key unless overridden
  if (!headers['Authorization']) {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.msg || data.error_description || data.message || 'Supabase Auth error');
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Register user via standard API. Sends OTP email if email confirmation is turned on.
 */
export async function signUp(email, password) {
  return supabaseRequest('/signup', { email, password });
}

export async function signInWithPassword(email, password) {
  return supabaseRequest('/token?grant_type=password', { email, password });
}

/**
 * Verify OTP code (for signup or recovery)
 * @param {string} email
 * @param {string} token 6-digit OTP code
 * @param {string} type 'signup' | 'recovery'
 */
export async function verifyOtp(email, token, type) {
  return supabaseRequest('/verify', { email, token, type });
}

/**
 * Send password recovery email (OTP)
 */
export async function recoverPassword(email) {
  return supabaseRequest('/recover', { email });
}

/**
 * Update user password using the accessToken obtained from verifyOtp recovery
 */
export async function updateUserPassword(accessToken, password) {
  return supabaseRequest('/user', { password }, 'PUT', {
    'Authorization': `Bearer ${accessToken}`
  });
}

/**
 * Send OTP (passwordless sign-in or registration confirmation)
 */
export async function sendOtp(email, createUser = true) {
  return supabaseRequest('/otp', { email, create_user: createUser });
}

