import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireProfessor = false }) => {
  const { user, loading, isProfessor } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireProfessor && !isProfessor()) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;