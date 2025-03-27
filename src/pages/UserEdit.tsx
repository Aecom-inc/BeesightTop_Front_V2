import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ユーザー登録用の型
interface UserFormData {
  name: string;
  login_id: string;
  password: string;
}

const UserRegister: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    login_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('https://7fc0-163-44-52-101.ngrok-free.app/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`登録に失敗しました (ステータス: ${response.status})`);
      }

      // 結果を確認
      const result = await response.json();
      console.log('登録結果:', result);

      // 正常に登録が完了したら success を true に
      setSuccess(true);
      setFormData({ name: '', login_id: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'ユーザー登録でエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ユーザー編集</h1>

      {loading && <p className="text-gray-500">登録中...</p>}
      {error && <p className="beesight-red">{error}</p>}
      {success && <p className="text-green-500">ユーザーの登録が完了しました！</p>}

      <div className="editform">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="lavel-text" htmlFor="name">
              ユーザー名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="form1 w-full"
              required
            />
          </div>

          <div>
            <label className="lavel-text" htmlFor="login_id">
              ログインID
            </label>
            <input
              id="login_id"
              name="login_id"
              type="text"
              value={formData.login_id}
              onChange={handleChange}
              className="form1 w-full"
              required
            />
          </div>

          <div>
            <label className="lavel-text" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form1 w-full"
              required
            />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="edit_b2" disabled={loading}>
              登録
            </button>
          </div>
          <div className="flex justify-center">
            <Link to="/users" className="button2 mb-5 w-full">
              戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
