import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/footer';

// プロジェクトの詳細情報の型
interface ProjectDetailData {
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

// 端末情報の型
interface Device {
  terminal_id: string;
  name: string;
  alias: string | null;
  project_name: string;
  serial_no: string;
  os: string;
  os_ver: string;
  description: string | null;
  app: {
    app_id: number;
    name: string;
    description: string | null;
  };
}

// 認証履歴の型
interface AuthHistory {
  auth_history_id: string;
  project_id: number;
  project_name: string;
  api_key: string;
  terminal_id: string;
  terminal_name: string;
  serial_no: string;
  action: string;
  result: string;
  auth_msg: string;
  app_id: number;
  app_name: string;
  app_version: string;
  authenticate_at: string;
}

const ProjectDetail: React.FC = () => {
  const { project_id } = useParams<{ project_id: string }>();

  // プロジェクト詳細
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  // 端末一覧
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  // 認証履歴
  const [authHistories, setAuthHistories] = useState<AuthHistory[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // 全体のローディング
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!project_id) {
      setProjectError('プロジェクトIDがありません');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);

      // 1. プロジェクト詳細
      try {
        const resProject = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/projects/${project_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        const resultProject = await resProject.json();

        if (resultProject.success) {
          setProject(resultProject.data);
        } else {
          setProjectError('プロジェクト情報の取得に失敗しました');
        }
      } catch (err) {
        setProjectError('プロジェクト情報の取得中にエラーが発生しました');
      }

      // 2. 端末一覧
      try {
        const resDevices = await fetch(
          `https://85ef-163-44-52-101.ngrok-free.app/api/projects/${project_id}/terminals`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          },
        );
        const resultDevices = await resDevices.json();

        if (resultDevices.success) {
          setDevices(resultDevices.data);
        } else {
          setDevicesError('端末一覧の取得に失敗しました');
        }
      } catch (err) {
        setDevicesError('端末一覧の取得中にエラーが発生しました');
      }

      // 3. 認証履歴
      try {
        const resHistories = await fetch(
          `https://85ef-163-44-52-101.ngrok-free.app/api/projects/${project_id}/auth/histories`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
          },
        );
        const resultHistories = await resHistories.json();

        if (resultHistories.success) {
          setAuthHistories(resultHistories.data);
        } else {
          setAuthError('認証履歴の取得に失敗しました');
        }
      } catch (err) {
        setAuthError('認証履歴の取得中にエラーが発生しました');
      }

      setLoading(false);
    };

    fetchAllData();
  }, [project_id]);

  if (loading) return <p>データを取得中...</p>;

  return (
    <div>
      <h1 className="title1">プロジェクト詳細</h1>

      {/* プロジェクト詳細 */}
      {project ? (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold">{project.name}</h2>
          {projectError && <p className="text-red-500">{projectError}</p>}
          <p className="text-gray-600">API Key: {project.api_key}</p>
          <p className="text-gray-600">ステータス: {project.status}</p>
          <p className="text-gray-600">
            認証回数 / 端末制限: {project.activated_count} / {project.terminal_limit}
          </p>
          <p className="text-gray-600">開始日: {project.open_at}</p>
          <p className="text-gray-600">終了日: {project.close_at}</p>
          <p className="text-gray-600">説明: {project.description}</p>
        </div>
      ) : (
        <p className="text-gray-500">{projectError || 'プロジェクトが見つかりません'}</p>
      )}

      {/* 端末一覧 */}
      <h2 className="title2 mb-2">端末一覧</h2>
      {devicesError && <p className="text-red-500">{devicesError}</p>}
      {devices.length > 0 ? (
        <table className="w-full text-left text-sm tableborder1 bg-white tablepadding1">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">端末ID</th>
              <th className="py-2 px-4">端末名</th>
              <th className="py-2 px-4">別名</th>
              <th className="py-2 px-4">シリアルNo</th>
              <th className="py-2 px-4">OS / バージョン</th>
              <th className="py-2 px-4">アプリ</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.terminal_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{device.terminal_id}</td>
                <td className="py-2 px-4">{device.name}</td>
                <td className="py-2 px-4">{device.alias || '-'}</td>
                <td className="py-2 px-4">{device.serial_no}</td>
                <td className="py-2 px-4">
                  {device.os} / v{device.os_ver}
                </td>
                <td className="py-2 px-4">{device.app?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mb-6">端末がありません</p>
      )}

      {/* 認証履歴 */}
      <h2 className="title2 mb-2 mt-5">認証履歴</h2>
      {authError && <p className="text-red-500">{authError}</p>}
      {authHistories.length > 0 ? (
        <table className="w-full text-left text-sm tableborder1 bg-white tablepadding1">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">History ID</th>
              <th className="py-2 px-4">端末名</th>
              <th className="py-2 px-4">シリアルNo</th>
              <th className="py-2 px-4">操作</th>
              <th className="py-2 px-4">結果</th>
              <th className="py-2 px-4">メッセージ</th>
              <th className="py-2 px-4">アプリ情報</th>
              <th className="py-2 px-4">認証日時</th>
            </tr>
          </thead>
          <tbody>
            {authHistories.map((hist) => (
              <tr key={hist.auth_history_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{hist.auth_history_id}</td>
                <td className="py-2 px-4">{hist.terminal_name}</td>
                <td className="py-2 px-4">{hist.serial_no}</td>
                <td className="py-2 px-4">{hist.action}</td>
                <td className="py-2 px-4">{hist.result}</td>
                <td className="py-2 px-4">{hist.auth_msg}</td>
                <td className="py-2 px-4">
                  {hist.app_name} v{hist.app_version}
                </td>
                <td className="py-2 px-4">{hist.authenticate_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">認証履歴がありません</p>
      )}

      <Footer />
    </div>
  );
};
export default ProjectDetail;
