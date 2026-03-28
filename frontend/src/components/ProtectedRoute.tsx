import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

type Props = { children: React.ReactNode };

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export const OwnerRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== 'OWNER') {
    return <Navigate to="/search" replace />;
  }

  return <>{children}</>;
};
