import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import SearchBar from '../components/searchBar';
import Pagination from '../components/Pagination';

// ★ 追加
import api from '../services/api';

// 承認データの型
interface Approval {
  auth_history_id: string;
  project_id: number;
  project_name: string;
  api_key: string;
  terminal_name: string;
  serial_no: string;
  mac_address: string;
  action: string;
  result: string;
  auth_msg: string;
  app_name: string;
  app_version: string;
  authenticate_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number;
  to: number;
  links: PaginationLink[];
}

interface AuthHistoryResponse {
  success: boolean;
  message: string;
  data: Approval[];
  pagination: PaginationData;
}

const AuthHistory: React.FC = () => {
  const [approvalData, setApprovalData] = useState<Approval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ページネーション情報
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  // 現在のページ
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 検索クエリ
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigate = useNavigate();

  // ① データ取得 (サーバーサイド検索 + ページング)
  const fetchHistories = async (page: number, query: string) => {
    setLoading(true);
    setError(null);

    try {
      // ★ ここを fetch → api.authHistory.getHistories に変更
      const result: AuthHistoryResponse = await api.authHistory.getHistories(page, query);

      if (result.success) {
        setApprovalData(result.data);
        setPagination(result.pagination);
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (err: any) {
      setError('データの取得中にエラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ② マウント時 + currentPage / searchQuery が変わるたびにAPIリクエスト
  useEffect(() => {
    fetchHistories(currentPage, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  // ③ 検索バーからのコールバック
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // 新しい検索なので1ページ目に戻す
  };

  // ④ ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1 className="title1">認証履歴</h1>

      {/* SearchBar に onSearch を渡す => 入力の度に handleSearch */}
      <SearchBar onSearch={handleSearch} placeholder="プロジェクト名や端末名などを検索" />

      <div className="mt-8">
        <table className="text-sm tableborder1 tablepadding1">
          <thead>
            <tr>
              <th className="w-1/7">アクション/<br />プロジェクト名</th>
              <th>API Key</th>
              <th>端末名</th>
              <th>シリアル番号</th>
              <th>結果</th>
              <th>認証日時</th>
              <th>認証メッセージ</th>
              <th>アプリ情報</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="text-center">
                  データを取得中...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={8} className="text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}

            {/* 取得した approvalData をそのまま表示 (ローカルフィルタはしない) */}
            {!loading &&
              !error &&
              approvalData.map((data) => (
                <tr key={data.auth_history_id} className="hover:bg-gray-50">
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-center ${
                        data.action === 'activate'
                          ? 'bg-blue-100'
                          : data.action === 'deactivate'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      {data.action}
                    </span>
                    <p className="font-bold mt-2">
                      <a
                        href="#"
                        className="text-blue-500 underline cursor-pointer"
                        onClick={() => navigate(`/project/${data.project_id}`)}
                      >
                        {data.project_name}
                      </a>
                    </p>
                  </td>
                  <td>{data.api_key}</td>
                  <td>{data.terminal_name}</td>
                  <td>{data.serial_no}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-center ${
                        data.result === 'success'
                          ? 'bg-green-100'
                          : data.result === 'failure'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      {data.result}
                    </span>
                  </td>
                  <td>{data.authenticate_at}</td>
                  <td>{data.auth_msg}</td>
                  <td>
                    {data.app_name} v{data.app_version}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}
      <Footer />
    </div>
  );
};

export default AuthHistory;
