import axiosClient from './axiosClient';
import { clearAuthSession, hasValidAccessToken, isAccessTokenValid } from '../utils/authSession';

export function normalizeUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email ?? null,
    role: profile.role ?? 'USER',
    fullName: profile.fullName ?? profile.full_name ?? null,
    avatarUrl: profile.avatarUrl ?? profile.avatar_url ?? null,
    totalExp: profile.totalExp ?? profile.total_exp ?? 0,
    targetLevel: profile.targetLevel ?? profile.target_level ?? 'N5',
  };
}

export async function verifyAuthSession() {
  const token = localStorage.getItem('accessToken');
  if (!token || !isAccessTokenValid(token)) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await axiosClient.get('/auth/me');
    const user = normalizeUser(response.data);
    if (!user?.id) {
      clearAuthSession();
      return null;
    }
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    clearAuthSession();
    return null;
  }
}

const authApi = {
  login: async (payload) => {
    const url = '/auth/login';
    const response = await axiosClient.post(url, payload);
    
    const { accessToken, refreshToken, user } = response.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const normalizedUser = normalizeUser(user);
    if (normalizedUser?.id) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }
    
    return { ...response.data, user: normalizedUser };
  },

  register: async (payload) => {
    const url = '/auth/register';
    const response = await axiosClient.post(url, payload);
    return response.data;
  },

  sendOtp: async (payload) => {
    const url = '/auth/send-otp';
    const response = await axiosClient.post(url, payload);
    return response.data;
  },

  resendSignupOtp: async (email) => {
    const url = '/auth/resend-signup-otp';
    const response = await axiosClient.post(url, { email });
    return response.data;
  },

  verifyOtp: async (payload) => {
    const url = '/auth/verify-otp';
    const response = await axiosClient.post(url, payload);
    
    // verifyOtp returns the tokens inside response.data.data or response.data depending on the backend response.
    // auth.controller sends reply.code(200).send(result) directly where result has accessToken.
    const { accessToken, refreshToken, user } = response.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    const normalizedUser = normalizeUser(user);
    if (normalizedUser?.id) {
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    }
    
    return { ...response.data, user: normalizedUser };
  },

  getMe: async () => {
    const user = await verifyAuthSession();
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  },

  logout: () => {
    clearAuthSession();
  },

  forgotPassword: async (email) => {
    const url = '/auth/forgot-password';
    const response = await axiosClient.post(url, { email });
    return response.data;
  },

  resetPassword: async (newPassword, token) => {
    const url = '/auth/reset-password';
    const response = await axiosClient.post(
      url, 
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default authApi;
