import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

// ユーザー型定義
interface User {
  id: string;
  login_id: string;
  name: string;
}

// 認証コンテキスト型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<any>;
  logout: () => void;
  authRequest: <T>(method: string, url: string, data?: any) => Promise<T>;
}

// 認証プロバイダーのprops型定義
interface AuthProviderProps {
  children: ReactNode;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // アプリケーション起動時に認証状態を確認
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        // 保存されているトークンがあれば、デフォルトヘッダーに設定
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // トークンが有効か確認するためユーザー情報を取得
          const response = await axios.get<User>('https://8585-163-44-52-101.ngrok-free.app/api/user');
          setUser(response.data);
        } catch (error) {
          // トークンが無効な場合はログアウト処理
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ログイン処理
  const login = async (loginId: string, password: string) => {
    const response = await axios.post<{ token: string }>('https://8585-163-44-52-101.ngrok-free.app/api/login', {
      login_id: loginId,
      password: password,
    });

      const { token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // ユーザー情報の取得
      const userResponse = await axios.get<User>('https://8585-163-44-52-101.ngrok-free.app/api/user');
      setUser(userResponse.data);
      return response.data;
    };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // 認証が必要なAPIリクエストを行うためのラッパー関数
  const authRequest = async <T,>(method: string, url: string, data: any = null): Promise<T> => {
    try {
      const config = {
        method,
        url: `https://https://8585-163-44-52-101.ngrok-free.app/api/${url}`,
        ...(data && { data }),
      };

      const response = await axios<T>(config);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        logout();
      }
      throw error;
    }
  };

  return <AuthContext.Provider value={{ user, login, logout, loading, authRequest }}>{children}</AuthContext.Provider>;
};

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
