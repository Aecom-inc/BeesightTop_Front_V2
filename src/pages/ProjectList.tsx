import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/footer';
import SearchBar from '../components/searchBar';
import { PackagePlus } from 'lucide-react';
import Pagination from '../components/Pagination';

import { Project, PaginationData } from '../services/api';
import api from '../services/api';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filtered, setFiltered] = useState<Project[]>([]);

  // ページネーション
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // プロジェクト一覧API呼び出し
  const fetchProjects = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.projects.getProjects(page);
      console.log('ProjectList API result:', result);

      if (result.success) {
        setProjects(result.data);
        setFiltered(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        } else {
          setPagination(null);
        }
      } else {
        setError('データの取得に失敗しました');
      }
    } catch (err: any) {
      setError('データの取得中にエラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // フロント側検索
  const handleSearch = (query: string) => {
    if (!query) {
      setFiltered(projects);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const filteredList = projects.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    setFiltered(filteredList);
  };

  // 削除ハンドラ
  const handleDelete = async (projectId: number) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      const result = await api.projects.deleteProject(projectId);

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

  // マウント時 & currentPage 変化時にプロジェクト一覧取得
  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  // ページ切り替え
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
                認証回数 /<br />
                可能数
              </th>
              <th className="w-1/6">
                利用開始 /<br />
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
                      project.status === 'active'
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
                      {project.name}
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

      {/* ページネーション */}
      {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}

      <Footer />
    </div>
  );
};

export default ProjectList;
