import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/footer';

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
  expire_at: string;
  description: string | null;
  supplier: Supplier;
}

// フォームで入力・編集する型
interface KeyValue {
  key: string;
  value: string;
}
interface FormData {
  name: string;
  supplier_id: string;
  limit: number;
  used:number;
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

  // フォーム用ステート
  const [formData, setFormData] = useState<FormData>({
    name: '',
    supplier_id: '',
    limit: 0,
    used: 0,
    expire_at: '',
    description: '',
    keyValues: [],
  });

  // 1. マウント時にライセンス詳細を取得
  useEffect(() => {
    const fetchLicense = async () => {
      if (!license_id) {
        setError('ライセンスIDが指定されていません。');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/licenses/${license_id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (!res.ok) {
          throw new Error(`ライセンス取得失敗 (ステータス: ${res.status})`);
        }
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.message || 'ライセンス取得に失敗しました');
        }

        const lic: License = result.data;
        console.log('ライセンス詳細:', lic);
        console.log('lic.expire_at:', lic.expire_at);
        // ライセンスキーをパース → KeyValue[] に変換
        let parsed: KeyValue[] = [];

        const lk = lic.license_key;

        if (Array.isArray(lk)) {
          // すでに [{ key:'...', value:'...' }, ...] 形式
          parsed = lk as KeyValue[];
        } else if (typeof lk === 'string') {
          // JSON文字列としてパースが必要な場合
          try {
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

        // フォームに反映
        setFormData({
          name: lic.name,
          supplier_id: lic.supplier?.suppliers_id ? String(lic.supplier.suppliers_id) : '',
          limit: lic.limit,
          used: lic.used,
          expire_at: lic.expire_at ? lic.expire_at.substring(0, 10) : '', // '2025-08-19' 部分を抽出
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

  // 2. フォーム入力ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. keyValue ペアの変更ハンドラ
  const handleKeyValueChange = (index: number, field: 'key' | 'value', newVal: string) => {
    setFormData((prev) => {
      const newArr = [...prev.keyValues];
      newArr[index] = { ...newArr[index], [field]: newVal };
      return { ...prev, keyValues: newArr };
    });
  };

  // 4. +ボタンでキー&バリュー追加
  const addKeyValuePair = () => {
    setFormData((prev) => ({
      ...prev,
      keyValues: [...prev.keyValues, { key: '', value: '' }],
    }));
  };

  // 5. 削除ボタンでキー&バリュー削除
  const removeKeyValuePair = (index: number) => {
    setFormData((prev) => {
      const newArr = [...prev.keyValues];
      newArr.splice(index, 1);
      return { ...prev, keyValues: newArr };
    });
  };

  // 6. 送信 (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!license_id) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      // keyValues を JSON.stringify で { k:v, k2:v2 } の形に組み立てる
      // 例: [{"key":"AAA","value":"BBB"}] → { AAA:'BBB' } に組み直して JSON化
      const obj: Record<string, any> = {};
      formData.keyValues.forEach((pair) => {
        if (pair.key) obj[pair.key] = pair.value;
      });
      // const licenseKeyJson = JSON.stringify(obj); // => "{\"AAA\":\"BBB\"}"

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

      const res = await fetch(`https://85ef-163-44-52-101.ngrok-free.app/api/licenses/${license_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('サーバーエラー:', data);
        if (data && data.errors) {
          setValidationErrors(data.errors);
        }

        throw new Error(data?.message || 'ライセンス更新に失敗しました');
      }

      const result = await res.json();
      if (!result.success) {
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        throw new Error(result.message || 'ライセンス更新に失敗しました');
      }
      setSuccess(true);
      // alert('ライセンスを更新しました');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <p>読み込み中...</p>;
  // if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="title1">ライセンス編集</h1>

      {loading && <p>送信中...</p>}
      {/* グローバルな error (message) */}
      {error && <p className="beesight-red">{error}</p>}

      {/* フィールド単位のエラーメッセージをまとめて表示 */}
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
              supplier_id（ライセンス発行企業ID）<span className="beesight-red ">※</span>
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

          {/* 複数の key/value を設定するフォーム */}
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
            {/* +ボタン */}
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
