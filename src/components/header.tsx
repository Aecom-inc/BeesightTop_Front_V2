import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  // useAuth から user情報 / logout関数を取得
  const { user, logout } = useAuth();

  // ログアウトボタンのハンドラ
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="flex items-center justify-between bg-white py-4">
      <div className="flex items-center px-4">
        <a href="#/" className="flex items-center">
          <img src="/images/aecomkun.svg" alt="Aecomkun" className="w-8 h-8 mr-2" />
          <span className="beesight-red font-bold text-lg">Beesight TOP V2</span>
        </a>
      </div>

      <div className="flex items-center mr-4">
        <span className="mr-2">
          <User size={24} />
        </span>

        {/* 例: ログイン中ユーザー名を表示 */}
        {user && <span className="mr-4">{user.name} さん</span>}

        {/* ログアウトボタン */}
        <button onClick={handleLogout} className="border px-2 py-1 rounded hover:bg-gray-100">
          ログアウト
        </button>
      </div>
    </header>
  );
};

export default Header;
