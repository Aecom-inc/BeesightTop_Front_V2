import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/footer';

// ★ 追加
import api from '../services/api';

interface Supplier {
  suppliers_id: number | null;
  suppliers_name: string;
}

interface LicenseData {
  license_id: number;
  name: string;
  license_key: string; // or array
  used: number;
  limit: number;
  expire_at: string;
  description: string | null;
  supplier: Supplier;
}

interface KeyValue {
  key: string;
  value: string;
}
interface FormData {
  name: string;
  supplier_id: string;
  limit: number;
  used: number;
  expire_at: string;
  description: string;
  keyValues: KeyValue[];
}

interface ValidationErrors {
  [field: string]: string[];
}

const LicenseEdit: React.FC = () => {
  const { license_id } = useParams<{ license_id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    supplier_id: '',
    limit: 0,
    used: 0,
    expire_at: '',
    description: '',
    keyValues: [],
  });

  // 1) マウント時にライセンス詳細を取得
  useEffect(() => {
    const fetchLicense = async () => {
      if (!license_id) {
        setError('ライセンスIDが指定されていません。');
        setLoading(false);
        return;
      }
      try {
        // ★ fetch → api.license.getLicenseById
        const result = await api.license.getLicenseById(license_id);
        if (!result.success) {
          throw new Error(result.message || 'ライセンス取得に失敗しました');
        }

        const lic: LicenseData = result.data;
        console.log('ライセンス詳細:', lic);
        // ライセンスキーをパース → KeyValue[] に変換
        let parsed: KeyValue[] = [];

        const lk = lic.license_key;

        if (Array.isArray(lk)) {
          // すでに [{ key:'...', value:'...' }, ...] 形式
          parsed = lk as KeyValue[];
        } else if (typeof lk === 'string') {
          try {
            // JSON文字列をパースするなら
            const json = JSON.parse(lk);
            if (Array.isArray(json)) {
              parsed = json as KeyValue[];
            } else if (json && typeof json === 'object') {
              parsed = Object.entries(json).map(([k, v]) => ({
                key: k,
                value: String(v),
              }));
            }
          } catch (e) {
            console.error('license_key パース失敗:', e);
          }
        }

        setFormData({
          name: lic.name,
          supplier_id: lic.supplier?.suppliers_id ? String(lic.supplier.suppliers_id) : '',
          limit: lic.limit,
          used: lic.used,
          expire_at: lic.expire_at ? lic.expire_at.substring(0, 10) : '',
          description: lic.description || '',
          keyValues: parsed,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLicense();
  }, [license_id]);

  // 2) フォーム入力ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) keyValue ペアの変更
  const handleKeyValueChange = (index: number, field: 'key' | 'value', newVal: string) => {
    setFormData((prev) => {
      const newArr = [...prev.keyValues];
      newArr[index] = { ...newArr[index], [field]: newVal };
      return { ...prev, keyValues: newArr };
    });
  };

  // 4) +ボタンで追加
  const addKeyValuePair = () => {
    setFormData((prev) => ({
      ...prev,
      keyValues: [...prev.keyValues, { key: '', value: '' }],
    }));
  };

  // 5) 削除ボタンで削除
  const removeKeyValuePair = (index: number) => {
    setFormData((prev) => {
      const newArr = [...prev.keyValues];
      newArr.splice(index, 1);
      return { ...prev, keyValues: newArr };
    });
  };

  // 6) 送信 (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license_id) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      // keyValues をそのまま送るか、JSON化するかはサーバー仕様による
      // ここでは "license_key: formData.keyValues" の形で送信している
      const payload = {
        name: formData.name,
        supplier_id: Number(formData.supplier_id),
        limit: Number(formData.limit),
        used: Number(formData.used),
        expire_at: formData.expire_at,
        description: formData.description,
        license_key: formData.keyValues,
      };
      console.log('PUT送信payload:', payload);

      // ★ fetch → api.license.updateLicense
      const result = await api.license.updateLicense(license_id, payload);
      console.log('更新結果:', result);

      if (!result.success) {
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        throw new Error(result.message || 'ライセンス更新に失敗しました');
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  // エラー時
  // if (error) return <p className="text-red-500">{error}</p>;
  // ↑ もしコンポーネント全体を中断したいなら上記のようにするが、
  //   下記のようにフォーム上にエラーを出し続けたいなら中断しなくてもOK。

  return (
    <div>
      <h1 className="title1">ライセンス編集</h1>

      {error && <p className="beesight-red">{error}</p>}
      {Object.keys(validationErrors).length > 0 && (
        <div className="beesight-red mb-4">
          <ul>
            {Object.entries(validationErrors).map(([field, messages]) => (
              <li key={field}>
                <strong>{field}:</strong> {messages.join(' / ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="editform">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* name */}
          <div>
            <label className="lavel-text">
              ライセンス名<span className="beesight-red ">※</span>
            </label>
            <input name="name" value={formData.name} onChange={handleChange} className="form1 w-full" />
          </div>

          {/* supplier_id */}
          <div>
            <label className="lavel-text">
              supplier_id (ライセンス発行企業ID)<span className="beesight-red ">※</span>
            </label>
            <input
              name="supplier_id"
              type="number"
              value={formData.supplier_id}
              onChange={handleChange}
              className="form1 w-full"
            />
          </div>

          {/* limit */}
          <div>
            <label className="lavel-text">
              使用上限<span className="beesight-red ">※</span>
            </label>
            <input name="limit" type="number" value={formData.limit} onChange={handleChange} className="form1 w-1/3" />
          </div>

          {/* used */}
          <div>
            <label className="lavel-text">使用数</label>
            <input name="used" type="number" value={formData.used} onChange={handleChange} className="form1 w-1/3" />
          </div>

          {/* expire_at */}
          <div>
            <label className="lavel-text">
              使用期限<span className="beesight-red ">※</span>
            </label>
            <input
              name="expire_at"
              type="date"
              value={formData.expire_at}
              onChange={handleChange}
              className="form1 w-1/3"
            />
          </div>

          {/* description */}
          <div>
            <label className="lavel-text">補足情報</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form1 w-full"
            />
          </div>

          {/* 複数の key/value 入力 */}
          <div>
            <label className="lavel-text">
              ライセンスキー (複数ペア)<span className="beesight-red ">※</span>
            </label>
            {formData.keyValues.map((kv, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  placeholder="キー"
                  value={kv.key}
                  onChange={(e) => handleKeyValueChange(index, 'key', e.target.value)}
                  className="form1 w-32"
                />
                <input
                  placeholder="バリュー"
                  value={kv.value}
                  onChange={(e) => handleKeyValueChange(index, 'value', e.target.value)}
                  className="form1 w-1/3"
                />
                <button
                  type="button"
                  onClick={() => removeKeyValuePair(index)}
                  className="border border-gray-500 text-gray-500 px-2 rounded"
                >
                  削除
                </button>
              </div>
            ))}
            {/* 追加ボタン */}
            <button
              type="button"
              onClick={addKeyValuePair}
              className="border border-gray-500 text-gray-500 px-2 rounded"
            >
              + 追加
            </button>
          </div>

          {success && <p className="text-green-500">更新が完了しました！</p>}

          <div className="flex justify-center">
            <button type="submit" className="edit_b2">
              更新
            </button>
          </div>
          <div className="flex justify-center">
            <Link to="/licenses" className="button2 mb-5 w-full">
              戻る
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default LicenseEdit;
