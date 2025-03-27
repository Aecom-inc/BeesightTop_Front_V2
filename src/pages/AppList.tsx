import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { AppleIcon } from 'lucide-react';
import api from '../services/api';
import { AppData } from '../services/api';


const AppList: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await api.app.getApps();
        setApps(data);
      } catch (err: any) {
        console.error(err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // ① 削除ボタンのハンドラ
  const handleDelete = async (appId: number) => {
    if (!window.confirm('本当にこのアプリを削除しますか？')) {
      return;
    }

    try {
      // ここをaxios利用のappServiceに変更
      await api.app.deleteApp(appId);

      // 削除が成功したら、apps ステートから対象を取り除いて画面を更新
      setApps((prev) => prev.filter((app) => app.app_id !== appId));
      alert('アプリを削除しました');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="title1">アプリ一覧</h1>

      <Link to="/apps/new" className="button1 mb-5 w-80">
        <span>
          <AppleIcon size={24} />
        </span>
        <p>アプリ新規登録</p>
      </Link>

      {loading && <p className="text-gray-500">読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* アプリ一覧テーブル */}
      {!loading && !error && apps.length > 0 && (
        <table className="text-sm tablepadding1 tableborder1">
          <thead>
            <tr>
              <th>アプリ名（アプリID）</th>
              <th>バージョン</th>
              <th>ライセンスID（ライセンスネーム）</th>
              <th>ステータス</th>
              <th>説明</th>
              <th className="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.app_id} className="hover:bg-gray-50">
                <td>
                  {app.name}（{app.app_id}）
                </td>
                <td>{app.version}</td>
                <td>
                  {app.licenses && app.licenses.length > 0
                    ? app.licenses.map((lic) => lic.license_id).join(', ')
                    : 'ライセンスなし'}
                  <br />（
                  {app.licenses && app.licenses.length > 0
                    ? app.licenses.map((lic) => lic.name).join(', ')
                    : 'ライセンスなし'}
                  ）
                </td>
                <td>
                  <span className="bg-blue-100 px-2 py-1 rounded-full">{app.status}</span>
                </td>
                <td>{app.description}</td>
                <td>
                  <div className="flex flex-col items-center space-y-2">
                    <button className="edit_b" onClick={() => navigate(`/apps/edit/${app.app_id}`)}>
                      編集
                    </button>
                    {/* <button className="delete_b" onClick={() => handleDelete(app.app_id)}>
                      削除
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && apps.length === 0 && <p className="text-gray-500">アプリがありません</p>}

      <Footer />
    </div>
  );
};

export default AppList;
