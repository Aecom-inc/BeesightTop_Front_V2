import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

interface License {
  license_id: number;
  name: string;
  // 他に必要があれば追加
}

interface FormData {
  name: string;
  version: string;
  status: string;
  description: string;
  license_ids: number[];
}

const AppRegister: React.FC = () => {
  // ▼ フォームデータ
  const [formData, setFormData] = useState<FormData>({
    name: '',
    version: '',
    status: 'active',
    description: '',
    license_ids: [],
  });

  // ▼ ライセンス一覧
  const [allLicenses, setAllLicenses] = useState<License[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  // ① `/api/licenses` を fetch → ライセンス一覧を取得
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
          // 例: [{"license_id":20,"name":"repudiandaeライセンス",...}, {...}, ...]
          setAllLicenses(result.data);
        } else {
        }
      } catch (err: any) {
      }
    };
    fetchLicenses();
  }, []);

  // ② 入力フォームの変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ③ ライセンスチェックボックスの変更ハンドラ
  const handleLicenseCheckbox = (licenseId: number, checked: boolean) => {
    setFormData((prev) => {
      const current = [...prev.license_ids];
      if (checked) {
        // チェックされた → 追加
        if (!current.includes(licenseId)) {
          current.push(licenseId);
        }
      } else {
        // チェック解除 → 削除
        const index = current.indexOf(licenseId);
        if (index !== -1) {
          current.splice(index, 1);
        }
      }
      return { ...prev, license_ids: current };
    });
  };

  // ④ フォーム送信 → POST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    setSuccess(false);

    try {

      const response = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.errors) {
          setError('入力値が不正です。');
          setErrorDetail(errorData.errors);
        } else if (errorData && errorData.message) {
          setError(errorData.message);
          setErrorDetail(errorData);
        } else {
          setError(`アプリ登録に失敗しました (ステータス: ${response.status})`);
        }
        return;
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'アプリ登録に失敗しました');
      }

      setSuccess(true);
      // フォームをリセット
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
