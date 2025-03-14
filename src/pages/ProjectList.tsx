import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/footer';
import SearchBar from '../components/searchBar';
import { PackagePlus } from 'lucide-react';
import Pagination from '../components/Pagination';

interface Project {
  project_id: number;
  name: string;
  api_key: string;
  status: string;
  activated_count: number;
  terminal_limit: number;
  open_at: string;
  close_at: string;
  description: string;
}

 // ページネーション
interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Pagination {
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

interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project[];
  pagination: Pagination;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);

  // ページネーション
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // ① APIリクエスト
  const fetchProjects = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/projects?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      const result: ProjectResponse = await response.json();
      console.log('ProjectList API result:', result);

      if (result.success) {
        setProjects(result.data);
        setFiltered(result.data); // 初期状態: 全件表示 or フィルタリング用
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

  // ② 検索ハンドラ (フロント側検索)
  const handleSearch = (query: string) => {
    if (!query) {
      setFiltered(projects);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filteredList = projects.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    setFiltered(filteredList);
  };

  // ③ 削除ハンドラ
  const handleDelete = async (projectId: number) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.log('エラー時レスポンス:', text);
        throw new Error(`プロジェクト削除失敗 (ステータス: ${res.status})`);
      }
      const result = await res.json();
      console.log('削除結果:', result);

      if (!result.success) {
        throw new Error(result.message || 'プロジェクト削除に失敗しました');
      }
      // ローカルリストから削除
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
      setFiltered((prev) => prev.filter((p) => p.project_id !== projectId));
      alert('プロジェクトを削除しました');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // 初回 & currentPage が変わるたびに fetch
  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  // ページ切り替えコールバック
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <p>データを取得中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="title1">プロジェクト一覧</h1>

      <div className="flex justify-between w-full mb-5">
        <Link to="/project_register" className="button1 w-80">
          <PackagePlus size={24} />
          <p>プロジェクト新規登録</p>
        </Link>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div>
        <table className="text-sm tableborder1 tablepadding1">
          <thead>
            <tr>
              <th>
                ステータス/
                <br />
                プロジェクト名
              </th>
              <th className="w-1/8">
                認証回数 / <br />
                可能数
              </th>
              <th className="w-1/6">
                利用開始 / <br />
                終了日
              </th>
              <th className="w-1/6">API Key</th>
              <th className="w-1/6">補足情報</th>
              <th className="w-1/8 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.project_id} className="hover:bg-gray-50">
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-center ${
                      project.status === 'activate'
                        ? 'bg-blue-100'
                        : project.status === 'inactive'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                    }`}
                  >
                    {project.status}
                  </span>
                  <p className="font-bold mt-2">
                    <a
                      href="#"
                      className="text-blue-500 underline cursor-pointer"
                      onClick={() => navigate(`/project/${project.project_id}`)}
                    >
                      {project.name}/{project.project_id}
                    </a>
                  </p>
                </td>
                <td>
                  {project.activated_count} / {project.terminal_limit}
                </td>
                <td>
                  {project.open_at} /<br /> {project.close_at}
                </td>
                <td>{project.api_key}</td>
                <td>{project.description}</td>
                <td className="align-middle text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <button className="edit_b" onClick={() => navigate(`/projects/edit/${project.project_id}`)}>
                      編集
                    </button>
                    <button className="delete_b" onClick={() => handleDelete(project.project_id)}>
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ⑤ ページネーション */}
      {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}

      <Footer />
    </div>
  );
};

export default ProjectList;
