import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post<{ token: string }>('https://8585-163-44-52-101.ngrok-free.app/api/login', {
        login_id: loginId,
        password: password,
      });

      // JWTトークンをローカルストレージに保存
      localStorage.setItem('token', response.data.token);

      // 認証用のデフォルトヘッダーを設定
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // ログイン成功後にダッシュボードなどにリダイレクト
      navigate('/');
    } catch (err: any) {
      // エラーハンドリング
      setError(err.response ? err.response.data.message : 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editform text-center">
      <h1 className="title1">ログイン</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center">
          <label htmlFor="login_id" className="mr-4">
            ログインID
          </label>
          <input
            type="text"
            id="login_id"
            className="form1"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-center">
          <label htmlFor="border-2" className="mr-4">
            パスワード
          </label>
          <input
            type="password"
            className="form1"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-center">
          <button type="submit" disabled={loading} className="button1">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
