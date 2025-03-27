import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { PlusIcon } from 'lucide-react';

import api from '../services/api';

interface Supplier {
  suppliers_id: number | null;
  suppliers_name: string;
}

interface License {
  license_id: number;
  name: string;
  license_key: string;
  used: number;
  limit: number;
  expire_at: string | null;
  description: string | null;
  supplier: Supplier;
}

const LicenseList: React.FC = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 一覧取得
  useEffect(() => {
    const fetchLicenses = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.license.getAllLicenses();
        if (result.success && result.data) {
          setLicenses(result.data);
        } else {
          setError('データの取得に失敗しました');
        }
      } catch (err: any) {
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchLicenses();
  }, []);

  // 削除ハンドラ
  const handleDelete = async (licenseId: number) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      const result = await api.license.deleteLicense(licenseId);
      if (!result || !result.success) {
        throw new Error(result?.message || 'ライセンス削除に失敗しました');
      }
      // 削除成功 → ローカルの状態から削除
      setLicenses((prev) => prev.filter((lic) => lic.license_id !== licenseId));
      alert('ライセンスを削除しました');
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="title1">外部ライセンス一覧</h1>

      {/* 新規登録ボタン */}
      <Link to="/licenses/new" className="button1 mb-5 w-80">
        <span>
          <PlusIcon size={24} />
        </span>
        <p>ライセンス新規登録</p>
      </Link>

      {licenses.length > 0 ? (
        <table className="text-sm tablepadding1 tableborder1">
          <thead>
            <tr>
              <th className="w-1/6">ライセンス名</th>
              <th className="w-1/6">ID：ライセンス発行企業</th>
              <th className="w-1/6">使用数 / 制限</th>
              <th className="w-1/6">期限</th>
              <th className="w-1/6">補足情報</th>
              <th className="w-1/6 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.license_id}>
                <td className="font-bold">{license.name}</td>
                <td>
                  {license.supplier.suppliers_id}:{license.supplier.suppliers_name}
                </td>
                <td>
                  {license.used} / {license.limit}
                </td>
                <td>{license.expire_at ?? '期限なし'}</td>
                <td>{license.description}</td>
                <td className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    {/* 編集ボタン */}
                    <button className="edit_b" onClick={() => navigate(`/licenses/edit/${license.license_id}`)}>
                      修正
                    </button>
                    {/* 削除ボタン */}
                    {/* <button className="delete_b" onClick={() => handleDelete(license.license_id)}>
                      削除
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">ライセンスがありません</p>
      )}

      <Footer />
    </div>
  );
};

export default LicenseList;
