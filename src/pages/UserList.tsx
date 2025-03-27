import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlusIcon } from 'lucide-react';

import api, { User } from '../services/api';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.users.getAllUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'ユーザー一覧の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="title1">ユーザー一覧</h1>
      <p className="mb-5">新規登録、編集ダミーです動きません。</p>

      <Link to="/users/new" className="button1 mb-5 w-80">
        <UserPlusIcon size={24} />
        <p>ユーザー登録</p>
      </Link>

      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ユーザー一覧テーブル */}
      {!loading && !error && users.length > 0 && (
        <table className="text-sm tablepadding1 tableborder1">
          <thead>
            <tr>
              <th>ユーザー名</th>
              <th>UserID</th>
              <th>ログインID（EMAIL仮）</th>
              <th className="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td>{user.name}</td>
                <td>{user.user_id}</td>
                <td>{user.email}</td>
                <td className="text-center">
                  <button
                    className="edit_b"
                    onClick={() => navigate(`/users/edit/${user.user_id}`)}
                  >
                    修正
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && users.length === 0 && <p className="text-gray-500">ユーザーがいません</p>}
    </div>
  );
};

export default UserList;
