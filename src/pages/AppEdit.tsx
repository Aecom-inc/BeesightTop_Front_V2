import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/footer';

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

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
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

  // 既存アプリ読み込みの状態
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  // ライセンス一覧
  const [allLicenses, setAllLicenses] = useState<License[]>([]);

  // 1) 既存アプリ情報をGET
  useEffect(() => {
    const fetchApp = async () => {
      if (!app_id) {
        setError('app_id が存在しません');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/apps/${app_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (!res.ok) {
          throw new Error(`アプリ詳細の取得に失敗しました (ステータス: ${res.status})`);
        }
        const result: ApiResponse = await res.json();
        if (!result.success || !result.data) {
          throw new Error(result.message || 'アプリ詳細の取得に失敗しました');
        }

        const appDetail = result.data;
        const licenseIDs = appDetail.licenses?.map((lic: any) => lic.license_id)

        setFormData({
          name: result.data.name || '',
          version: result.data.version || '',
          status: result.data.status || 'active',
          description: result.data.description || '',
          license_ids: licenseIDs, // 複数ライセンスをチェックボックスで扱う
        });
      } catch (err: any) {
        setError(err.message || 'アプリ詳細取得でエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [app_id]);

  // 2) ライセンス一覧をGET (複数チェック用)
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const res = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/licenses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (!res.ok) {
          throw new Error(`ライセンス一覧取得エラー (ステータス: ${res.status})`);
        }
        const result = await res.json();
        if (result.success) {
          // result.data はライセンスの配列
          setAllLicenses(result.data);
        } else {
          console.error('ライセンス一覧の取得に失敗:', result);
        }
      } catch (err: any) {
        console.error('ライセンス一覧のfetchエラー:', err);
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

      // 送信データ
      console.log('送信データ:', formData);

      const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/apps/${app_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.log('サーバーエラー内容:', errorData);
        if (errorData && errorData.errors) {
          setError('入力値が不正です。');
          setErrorDetail(errorData.errors);
        } else if (errorData && errorData.message) {
          setError(errorData.message);
          setErrorDetail(errorData);
        } else {
          setError(`アプリ更新に失敗しました (ステータス: ${res.status})`);
        }
        return;
      }

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'アプリ更新に失敗しました');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'ライセンス更新時にエラーが発生しました');
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
              className="form1 w-full"
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
              // チェック済みかどうか
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
