import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/footer';

// ★ 追加
import api from '../services/api';
import { AppData } from '../services/api';

interface License {
  license_id: number;
  name: string;
}

interface AppFormData {
  name: string;
  version: string;
  status: string;
  description: string;
  license_ids: number[];
}

const AppEdit: React.FC = () => {
  const { app_id } = useParams<{ app_id: string }>();

  // フォームデータ
  const [formData, setFormData] = useState<AppFormData>({
    name: '',
    version: '',
    status: 'active',
    description: '',
    license_ids: [],
  });

  // ステータス管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  // ライセンス一覧
  const [allLicenses, setAllLicenses] = useState<License[]>([]);

  // 1) 既存アプリ情報を GET
  useEffect(() => {
    const fetchAppData = async () => {
      if (!app_id) {
        setError('app_id が存在しません');
        setLoading(false);
        return;
      }
      try {
        // ★ fetch → api.app.getAppById に変更
        const result = await api.app.getAppById(app_id);
        if (!result.success || !result.data) {
          throw new Error(result.message || 'アプリ詳細の取得に失敗しました');
        }
        const appDetail = result.data as AppData;
        const licenseIDs = appDetail.licenses?.map((lic) => lic.license_id) || [];
        setFormData({
          name: appDetail.name || '',
          version: appDetail.version || '',
          status: appDetail.status || 'active',
          description: appDetail.description || '',
          license_ids: licenseIDs,
        });
      } catch (err: any) {
        setError(err.message || 'アプリ詳細取得でエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAppData();
  }, [app_id]);

  // 2) ライセンス一覧をGET
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        // ★ fetch → api.license.getAllLicenses に変更
        const result = await api.license.getAllLicenses();
        if (result.success) {
          setAllLicenses(result.data);
        } else {
          console.error('ライセンス一覧の取得に失敗:', result);
        }
      } catch (err: any) {
        console.error('ライセンス一覧取得エラー:', err);
      }
    };
    fetchLicenses();
  }, []);

  // テキスト入力などのハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ライセンスチェックボックスのハンドラ
  const handleLicenseCheckbox = (licenseId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = [...prev.license_ids];
      if (checked) {
        if (!current.includes(licenseId)) {
          current.push(licenseId);
        }
      } else {
        const idx = current.indexOf(licenseId);
        if (idx !== -1) {
          current.splice(idx, 1);
        }
      }
      return { ...prev, license_ids: current };
    });
  };

  // 3) 更新リクエスト (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    setSuccess(false);

    try {
      if (!app_id) {
        throw new Error('app_id がありません');
      }

      // ★ fetch → api.app.updateApp に変更
      const result = await api.app.updateApp(app_id, formData);
      if (!result.success) {
        // バリデーションエラー等、サーバーからのエラーメッセージ
        if (result.errors) {
          setErrorDetail(result.errors);
          throw new Error(result.message || '入力値が不正です。');
        } else {
          throw new Error(result.message || 'アプリ更新に失敗しました');
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'アプリ更新時にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="title1">アプリ編集</h1>
      {errorDetail && (
        <pre className="bg-gray-100 p-2 text-sm beesight-red">{JSON.stringify(errorDetail, null, 2)}</pre>
      )}

      <div className="editform">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div>
            <label htmlFor="name" className="lavel-text">
              アプリ名<span className="beesight-red ">※</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="form1 w-full border-2"
              required
            />
          </div>

          {/* version */}
          <div>
            <label htmlFor="version" className="lavel-text">
              バージョン<span className="beesight-red ">※</span>
            </label>
            <input
              id="version"
              name="version"
              type="text"
              value={formData.version}
              onChange={handleChange}
              className="form1 w-1/3"
              required
            />
          </div>

          {/* status */}
          <div>
            <label htmlFor="status" className="lavel-text">
              ステータス<span className="beesight-red ">※</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form1 w-1/3"
              required
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          {/* description */}
          <div>
            <label htmlFor="description" className="lavel-text">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form1 w-full"
              rows={3}
            />
          </div>

          {/* 複数ライセンス: checkboxes */}
          <div>
            <label className="lavel-text">
              ライセンスを選択 (複数可)<span className="beesight-red ">※</span>
            </label>
            {allLicenses.map((lic) => {
              const checked = formData.license_ids.includes(lic.license_id);
              return (
                <label key={lic.license_id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleLicenseCheckbox(lic.license_id, e.target.checked)}
                  />
                  <span>
                    {lic.name} (ID: {lic.license_id})
                  </span>
                </label>
              );
            })}
          </div>
          {success && <p className="text-green-500">アプリが更新されました！</p>}
          <div className="flex justify-center">
            <button type="submit" className="edit_b2" disabled={loading}>
              更新
            </button>
          </div>
          <div className="flex justify-center">
            <Link to="/apps" className="button2 mb-5 w-full">
              戻る
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AppEdit;
