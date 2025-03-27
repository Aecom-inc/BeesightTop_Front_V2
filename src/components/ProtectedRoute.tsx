import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // 認証状態をロード中の場合はローディング表示
  if (loading) {
    return <div>Loading...</div>;
  }

  // ユーザーが認証されていない場合はログインページにリダイレクト
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
