import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi, { normalizeUser, verifyAuthSession } from '../api/authApi';
import { clearAuthSession, hasValidAccessToken } from '../utils/authSession';

const AuthContext = createContext({
  status: 'loading',
  user: null,
  isAuthenticated: false,
  refreshAuth: async () => null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  const refreshAuth = useCallback(async () => {
    if (!hasValidAccessToken()) {
      clearAuthSession();
      setUser(null);
      setStatus('ready');
      return null;
    }

    setStatus('loading');
    const verifiedUser = await verifyAuthSession();
    setUser(verifiedUser);
    setStatus('ready');
    return verifiedUser;
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setStatus('ready');
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthenticated: Boolean(user),
      refreshAuth,
      setUser: (nextUser) => setUser(normalizeUser(nextUser)),
      logout,
    }),
    [status, user, refreshAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useCallback(() => {
    logout();
    navigate('/', { replace: true });
  }, [logout, navigate]);
}

export default AuthContext;
