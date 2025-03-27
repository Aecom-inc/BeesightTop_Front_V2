import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

// ★ 追加
import api from '../services/api';

interface License {
  license_id: number;
  name: string;
  // ...
}

interface FormData {
  name: string;
  version: string;
  status: string;
  description: string;
  license_ids: number[];
}

const AppRegister: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    version: '',
    status: 'active',
    description: '',
    license_ids: [],
  });

  // ライセンス一覧
  const [allLicenses, setAllLicenses] = useState<License[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  // 1) /api/licenses を axios で取得
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        // ★ fetch → api.license.getAllLicenses に置き換え
        const result = await api.license.getAllLicenses();
        if (result.success) {
          setAllLicenses(result.data);
        } else {
          setError('ライセンス一覧の取得に失敗しました');
        }
      } catch (err: any) {
        setError('ライセンス一覧取得中にエラーが発生: ' + err.message);
      }
    };
    fetchLicenses();
  }, []);

  // 入力フォーム
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ライセンスチェックボックス
  const handleLicenseCheckbox = (licenseId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = [...prev.license_ids];
      if (checked) {
        if (!current.includes(licenseId)) {
          current.push(licenseId);
        }
      } else {
        const index = current.indexOf(licenseId);
        if (index !== -1) {
          current.splice(index, 1);
        }
      }
      return { ...prev, license_ids: current };
    });
  };

  // 2) POST → 新規登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    setSuccess(false);

    try {
      // ★ fetch → api.app.createApp(formData) に変更
      const result = await api.app.createApp(formData);
      if (!result.success) {
        // サーバー側でバリデーションNGなど
        if (result.errors) {
          setErrorDetail(result.errors);
          throw new Error(result.message || '入力値が不正です。');
        } else {
          throw new Error(result.message || 'アプリ登録に失敗しました');
        }
      }

      setSuccess(true);
      // フォームリセット
      setFormData({
        name: '',
        version: '',
        status: 'active',
        description: '',
        license_ids: [],
      });
    } catch (err: any) {
      setError(err.message || 'アプリ登録でエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title1">アプリ新規登録</h1>
      {loading && <p className="text-gray-500">登録処理中...</p>}
      {error && <p className="text-red-500">{error}</p>}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className="form1 w-full"
              rows={3}
            />
          </div>

          {/* ライセンス一覧 (チェックボックス) */}
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

          {success && <p className="text-green-500">アプリが正常に登録されました！</p>}
          <div className="flex justify-center">
            <button type="submit" className="edit_b2" disabled={loading}>
              登録
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

export default AppRegister;
