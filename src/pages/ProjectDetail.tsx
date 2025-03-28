import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/footer';
import Pagination from '../components/Pagination';

import {  PaginationData } from '../services/api';
import api from '../services/api';

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

  // 端末一覧のページネーション
  const [devicesPage, setDevicesPage] = useState<number>(1);
  const [devicesPagination, setDevicesPagination] = useState<PaginationData | null>(null);

  // 認証履歴のページネーション
  const [authPage, setAuthPage] = useState<number>(1);
  const [authPagination, setAuthPagination] = useState<PaginationData | null>(null);

  // 全体のローディング
  const [loading, setLoading] = useState<boolean>(true);

  // プロジェクト詳細は1回だけ取得
  useEffect(() => {
    if (!project_id) {
      setProjectError('プロジェクトIDがありません');
      setLoading(false);
      return;
    }

    const fetchProjectDetail = async () => {
      setLoading(true);
      try {
        const resultProject = await api.projects.getProjectById(project_id);
        if (resultProject.success && resultProject.data) {
          setProject({
            project_id: resultProject.data.id,
            name: resultProject.data.name,
            api_key: resultProject.data.api_key,
            status: resultProject.data.status,
            activated_count: resultProject.data.activated_count,
            terminal_limit: resultProject.data.terminal_limit,
            open_at: resultProject.data.open_at,
            close_at: resultProject.data.close_at,
            description: resultProject.data.description,
          });
        } else {
          setProjectError(resultProject.message || 'プロジェクト情報の取得に失敗しました');
        }
      } catch (err: any) {
        setProjectError('プロジェクト情報の取得中にエラーが発生しました');
      }
      setLoading(false);
    };

    fetchProjectDetail();
  }, [project_id]);

  // 2) 端末一覧 (devicesPage が変わるたびに再取得)
  useEffect(() => {
    if (!project_id) return;

    const fetchDevices = async () => {
      try {
        const resultDevices = await api.projects.getTerminalsByProjectId(project_id, devicesPage);
        if (resultDevices.success && resultDevices.data) {
          setDevices(resultDevices.data);
          if (resultDevices.pagination) {
            setDevicesPagination(resultDevices.pagination);
          } else {
            setDevicesPagination(null);
          }
        } else {
          setDevicesError(resultDevices.message || '端末一覧の取得に失敗しました');
        }
      } catch (err: any) {
        setDevicesError('端末一覧の取得中にエラーが発生しました');
      }
    };

    fetchDevices();
  }, [project_id, devicesPage]);

  // 3) 認証履歴 (authPage が変わるたびに再取得)
  useEffect(() => {
    if (!project_id) return;

    const fetchHistories = async () => {
      try {
        const resultHistories = await api.projects.getAuthHistoriesByProjectId(project_id, authPage);
        if (resultHistories.success && resultHistories.data) {
          setAuthHistories(resultHistories.data);
          if (resultHistories.pagination) {
            setAuthPagination(resultHistories.pagination);
          } else {
            setAuthPagination(null);
          }
        } else {
          setAuthError(resultHistories.message || '認証履歴の取得に失敗しました');
        }
      } catch (err: any) {
        setAuthError('認証履歴の取得中にエラーが発生しました');
      }
    };

    fetchHistories();
  }, [project_id, authPage]);

  if (loading) return <p>データを取得中...</p>;

  return (
    <div>
      <h1 className="title1">プロジェクト詳細</h1>

      {/* プロジェクト詳細 */}
      {project ? (
        <div className="bg-white p-6 rounded-lg mb-8">
          <p className=" mb-3 font-bold">
            <span
              className={`px-3 py-1 rounded-full text-center ${
                project.status === 'active'
                  ? 'bg-blue-100'
                  : project.status === 'inactive'
                    ? 'bg-red-100'
                    : 'bg-yellow-100'
              }`}
            >
              {' '}
              {project.status}
            </span>
          </p>
          <h2 className="text-xl font-bold mb-3">{project.name}</h2>
          {projectError && <p className="text-red-500">{projectError}</p>}
          <p className="mb-2">API Key：{project.api_key}</p>
          <p className=" mb-2">
            {/* 認証回数/端末制限：{project.activated_count} / {project.terminal_limit} */}
            端末制限：{project.terminal_limit}
          </p>
          <p className="mb-2">開始日：{project.open_at}</p>
          <p className="mb-2">終了日：{project.close_at}</p>
          <p className="mb-2">{project.description}</p>
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
      {devicesPagination && <Pagination pagination={devicesPagination} onPageChange={(page) => setDevicesPage(page)} />}

      {/* 認証履歴 */}
      <h2 className="title2 mb-2 mt-5">認証履歴</h2>
      {authError && <p className="text-red-500">{authError}</p>}
      {authHistories.length > 0 ? (
        <table className="w-full text-left text-sm tableborder1 bg-white tablepadding1">
          <thead>
            <tr className="border-b">
              {/* <th className="py-2 px-4">History ID</th> */}
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
                {/* <td className="py-2 px-4">{hist.auth_history_id}</td> */}
                <td className="py-2 px-4">{hist.terminal_name}</td>
                <td className="py-2 px-4">{hist.serial_no}</td>
                <td className="py-2 px-4">{hist.action}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-center ${
                      hist.result === 'success'
                        ? 'bg-green-100'
                        : hist.result === 'failure'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                    }`}
                  >
                    {hist.result}
                  </span>
                </td>
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
      {authPagination && <Pagination pagination={authPagination} onPageChange={(page) => setAuthPage(page)} />}

      <Footer />
    </div>
  );
};

export default ProjectDetail;
