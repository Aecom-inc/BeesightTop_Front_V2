import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { AppleIcon } from 'lucide-react';

// ライセンス型
interface AppLicense {
  license_id: number;
  name: string;
  license_key: string;
  used: number;
  limit: number;
  expired_at: string | null;
}

// サプライヤー型
interface AppSupplier {
  supplier_id: number;
  name: string;
}

// アプリ情報の型
interface AppData {
  app_id: number;
  name: string;
  version: string;
  description: string | null;
  status: string;
  licenses: AppLicense[];
  supplier: AppSupplier;
}

interface AppResponse {
  success: boolean;
  message: string;
  data: AppData[];
}

const AppList: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/apps', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP エラー (ステータス: ${response.status})`);
        }

        const result: AppResponse = await response.json();
        console.log('AppList API result:', result);

        if (result.success) {
          setApps(result.data);
        } else {
          setError('データの取得に失敗しました');
        }
      } catch (err: any) {
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
      const response = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/apps/${appId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.log('削除失敗レスポンス:', text);
        throw new Error(`アプリ削除失敗 (ステータス: ${response.status})`);
      }

      const result = await response.json();
      console.log('削除結果:', result);

      if (!result.success) {
        throw new Error(result.message || 'アプリ削除に失敗しました');
      }

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
              <th>アプリ名</th>
              <th>バージョン</th>
              <th>ライセンスID</th>
              <th>ステータス</th>
              <th>説明</th>
              <th className='text-center'>操作</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.app_id} className="hover:bg-gray-50">
                <td>{app.name}</td>
                <td>{app.version}</td>
                <td>
                  {app.licenses && app.licenses.length > 0
                    ? app.licenses.map((lic) => lic.license_id).join(', ')
                    : 'ライセンスなし'}
                  {/* <br />
                 （ {app.licenses && app.licenses.length > 0
                    ? app.licenses.map((lic) => lic.name).join(', ')
                    : 'ライセンスなし'}） */}
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
                    <button className="delete_b" onClick={() => handleDelete(app.app_id)}>
                    削除
                    </button>
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
