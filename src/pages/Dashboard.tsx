import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/footer';
import { ArrowRight, Plus, Search } from 'lucide-react';

// 「最新の承認」用の型
interface HistoryData {
  project_id: number;
  authenticate_at: string;
  action: string;
  project_name: string;
}

// 「プロジェクト検索」結果用の型
interface Project {
  project_id: number;
  name: string;
  // 他に必要であれば追加 (api_key, status, etc.)
}

const Dashboard: React.FC = () => {
  // 最新承認の state
  const [histories, setHistories] = useState<HistoryData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  // プロジェクト検索用
  const [searchTerm, setSearchTerm] = useState(''); // 入力中テキスト
  const [searchResults, setSearchResults] = useState<Project[]>([]); // 検索結果
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);

  const navigate = useNavigate();

  // 1. 最新承認履歴の取得
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setLoadingHistory(true);
        const response = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/auth/histories?limit=5', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTPエラー: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          // 上位5件 or limit=5
          setHistories(result.data.slice(0, 5));
        } else {
          setErrorHistory('データの取得に失敗しました');
        }
      } catch (err: any) {
        setErrorHistory('データの取得中にエラーが発生しました');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistories();
  }, []);

  // 2. 「プロジェクト検索」ボタン押下時の処理
  const handleSearchProjects = async () => {
    if (!searchTerm) {
      // 空なら結果をクリア or 何もしない
      setSearchResults([]);
      return;
    }
    try {
      setLoadingSearch(true);
      setErrorSearch(null);

      const url = `https://85ef-163-44-52-101.ngrok-free.app/api/projects?search=${encodeURIComponent(searchTerm)}&limit=5`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`プロジェクト検索に失敗 (ステータス: ${response.status})`);
      }
      const result = await response.json();
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setErrorSearch('プロジェクト検索に失敗しました');
      }
    } catch (err: any) {
      setErrorSearch('検索中にエラーが発生: ' + err.message);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div>
      <h1 className="title1">Dashboard</h1>

      {/* 最新の承認リスト */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="title2">最新の承認</h2>

        {loadingHistory && <p className="text-gray-500">データを取得中...</p>}
        {errorHistory && <p className="text-red-500">{errorHistory}</p>}

        {!loadingHistory && !errorHistory && histories.length > 0 && (
          <table className="w-full text-left text-sm tablepadding1 tableborder2">
            <thead>
              <tr>
                <th className="w-1/5">日付</th>
                <th className="w-1/7">状態</th>
                <th>プロジェクト名</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td>{item.authenticate_at}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-center ${
                        item.action === 'activate'
                          ? 'bg-blue-100'
                          : item.action === 'deactivate'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      {item.action}
                    </span>
                  </td>
                  <td>
                    <a href="#" className=" cursor-pointer" onClick={() => navigate(`/project/${item.project_id}`)}>
                      {item.project_name}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loadingHistory && !errorHistory && histories.length === 0 && (
          <p className="text-gray-500">表示できる承認履歴がありません。</p>
        )}

        <p className="flex justify-end mt-2">
          <Link to="/history" className="flex items-center hover:underline">
            全て表示
            <ArrowRight size={16} />
          </Link>
        </p>
      </div>

      {/* プロジェクト検索と新規登録 */}
      <div className="dashboard-grid mt-6">
        {/* プロジェクト検索 */}
        <div className="flex flex-col flex-1 mr-2">
          <h3 className="title2">プロジェクト検索</h3>
          <div className="flex items-center">
            <label htmlFor="search" className="sr-only">
              プロジェクト検索
            </label>
            {/* 検索テキスト入力 & ボタン */}
            <div className="search1 flex items-center">
              <input
                type="text"
                id="search"
                placeholder="プロジェクト名を検索"
                className="border p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span>
                <Search size={20} />
              </span>
            </div>
            <button className="button1 ml-2" onClick={handleSearchProjects}>
              検索
            </button>
          </div>

          {/* 検索中 or エラー */}
          {loadingSearch && <p className="text-gray-500 mt-2">検索中...</p>}
          {errorSearch && <p className="text-red-500 mt-2">{errorSearch}</p>}

          {/* 検索結果の簡易表示 */}
          {!loadingSearch && !errorSearch && (
            <div className="mt-3">
              {searchResults.length > 0 ? (
                <table className="text-smbg-white p-2 rounded w-100 tableborder1　tablepadding1">
                  <tbody>
                    {searchResults.map((proj) => (
                      <tr key={proj.project_id}>
                        <td>{proj.name}</td>
                        <td className="py-1 beesight-red">
                          <button onClick={() => navigate(`/project/${proj.project_id}`)}>詳細</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">検索結果がありません</p>
              )}
            </div>
          )}
        </div>

        {/* プロジェクト新規登録 */}
        <div className="flex flex-col mt-5">
          <h3 className="title2">プロジェクト新規登録</h3>
          <Link to="/project_register" className="button1 flex items-center w-80">
            <Plus size={20} />
            プロジェクト新規登録
          </Link>
        </div>
      </div>

      {/* フッター */}
      <Footer />
    </div>
  );
};

export default Dashboard;
