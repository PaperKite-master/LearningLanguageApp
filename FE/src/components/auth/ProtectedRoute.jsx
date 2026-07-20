import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { status, user, isAuthenticated, refreshAuth } = useAuth();
  const [rechecking, setRechecking] = useState(false);

  const recheck = useCallback(async () => {
    setRechecking(true);
    await refreshAuth();
    setRechecking(false);
  }, [refreshAuth]);

  useEffect(() => {
    if (status === 'ready' && !isAuthenticated) {
      recheck();
    }
  }, [status, isAuthenticated, recheck]);

  if (status === 'loading' || rechecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
        Đang tải...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/study" replace />;
  }

  return children;
};

export default ProtectedRoute;
