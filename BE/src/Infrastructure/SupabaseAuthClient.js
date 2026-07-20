// Wrapper for Supabase Auth REST API
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseRequest(path, body = null, method = 'POST', customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    ...customHeaders,
  };

  if (!headers.Authorization) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
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

async function adminRequest(path, body = null, method = 'POST') {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    const err = new Error('Thiếu SUPABASE_SERVICE_ROLE_KEY trên server.');
    err.statusCode = 500;
    throw err;
  }

  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.msg || data.error_description || data.message || 'Supabase Admin Auth error');
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * Create user via Admin API — does not trigger Supabase OTP email.
 */
export async function createUserAdmin(email, password, userMetadata = {}) {
  return adminRequest('/admin/users', {
    email,
    password,
    email_confirm: false,
    user_metadata: userMetadata,
  });
}

export async function confirmUserEmailAdmin(userId) {
  return adminRequest(
    `/admin/users/${userId}`,
    { email_confirm: true },
    'PUT'
  );
}

export async function signUp(email, password) {
  return supabaseRequest('/signup', { email, password });
}

export async function signInWithPassword(email, password) {
  return supabaseRequest('/token?grant_type=password', { email, password });
}

export async function verifyOtp(email, token, type) {
  return supabaseRequest('/verify', { email, token, type });
}

export async function recoverPassword(email) {
  return supabaseRequest('/recover', { email });
}

export async function updateUserPassword(accessToken, password) {
  return supabaseRequest('/user', { password }, 'PUT', {
    Authorization: `Bearer ${accessToken}`,
  });
}

export async function sendOtp(email, createUser = true) {
  return supabaseRequest('/otp', { email, create_user: createUser });
}
