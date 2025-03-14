import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/footer';
import { PlusIcon } from 'lucide-react';

interface Supplier {
  suppliers_id: number | null;
  suppliers_name: string;
}

interface License {
  license_id: number;
  name: string;
  license_key: string; // 文字列か配列かはサーバー仕様に合わせる
  used: number;
  limit: number;
  expire_at: string | null;
  description: string | null;
  supplier: Supplier;
}

interface LicenseResponse {
  success: boolean;
  message: string;
  data: License[];
}

const LicenseList: React.FC = () => {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 一覧取得
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
          throw new Error(`ライセンス一覧取得失敗 (ステータス: ${res.status})`);
        }
        const result: LicenseResponse = await res.json();
        if (result.success) {
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
      const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/licenses/${licenseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.log('削除失敗レスポンス:', text);
        throw new Error(`ライセンス削除失敗 (ステータス: ${res.status})`);
      }

      const result = await res.json().catch(() => {});
      console.log('削除結果:', result);

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
              {/* <th className="w-20">ID</th> */}
              <th className="w-1/5">ライセンス名</th>
              <th className="w-1/5">使用数 / 制限</th>
              <th className="w-1/5">期限</th>
              <th className="w-1/5">補足情報</th>
              <th className="w-1/9 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => (
              <tr key={license.license_id}>
                {/* <td>{license.license_id}</td> */}
                <td className="font-bold">{license.name}</td>
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
                    <button className="delete_b" onClick={() => handleDelete(license.license_id)}>
                      削除
                    </button>
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
