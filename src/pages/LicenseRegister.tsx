import React, { useState } from 'react';
import Footer from '../components/footer';
import { Link } from 'react-router-dom';

// キー＆バリューの型
interface KeyValue {
  key: string;
  value: string;
}

// フォーム用の型
interface LicenseFormData {
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

const LicenseNew: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);

  // 新規なので初期値は空
  const [formData, setFormData] = useState<LicenseFormData>({
    name: '',
    supplier_id: '',
    limit: 0,
    used: 0,
    expire_at: '',
    description: '',
    keyValues: [],
  });

  // 入力ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // POST送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      const payload = {
        name: formData.name,
        supplier_id: Number(formData.supplier_id),
        limit: Number(formData.limit),
        used: Number(formData.used),
        expire_at: formData.expire_at,
        description: formData.description,
        license_key: formData.keyValues,
      };
      console.log('新規登録 payload:', payload);

      const res = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);

        if (data && data.errors) {
          // API が { errors: {フィールド名: [メッセージ1, メッセージ2...]}, message: "..." } などで返してくる
          setValidationErrors(data.errors);
        }
        setError(data?.message || 'ライセンス新規作成に失敗しました');
        setLoading(false);
        return;
      }
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'ライセンス新規作成に失敗しました');
      }

      setSuccess(true);
      // フォームリセット
      setFormData({
        name: '',
        supplier_id: '',
        limit: 0,
        used: 0,
        expire_at: '',
        description: '',
        keyValues: [],
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title1">ライセンス 新規登録</h1>
      {loading && <p>送信中...</p>}
      {error && <p className="beesight-red">{error}</p>}
      {Object.keys(validationErrors).length > 0 && (
        <div className="beesight-red">
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
          <div>
            <label className="lavel-text">
              ライセンス名<span className="beesight-red ">※</span>
            </label>
            <input name="name" value={formData.name} onChange={handleChange} className="form1 w-full" />
          </div>

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

          <div>
            <label className="lavel-text">
              使用上限<span className="beesight-red ">※</span>
            </label>
            <input name="limit" type="number" value={formData.limit} onChange={handleChange} className="form1 w-1/3" />
          </div>

          <div>
            <label className="lavel-text">使用数</label>
            <input name="used" type="number" value={formData.used} onChange={handleChange} className="form1 w-1/3" />
          </div>

          <div>
            <label className="lavel-text">
              使用期限<span className="beesight-red ">※</span>
            </label>
            <input
              name="expire_at"
              type="date"
              value={formData.expire_at}
              onChange={handleChange}
              className="form1 1/3"
            />
          </div>

          <div>
            <label className="lavel-text">補足情報</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form1 w-full"
            />
          </div>

          {/* ライセンスキー (複数ペア) */}
          <div>
            <label className="lavel-text">
              ライセンスキー (複数ペア)<span className="beesight-red ">※</span>
            </label>
            {formData.keyValues.map((kv, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  placeholder="キー"
                  value={kv.key}
                  onChange={(e) => {
                    const newArr = [...formData.keyValues];
                    newArr[index] = { ...newArr[index], key: e.target.value };
                    setFormData({ ...formData, keyValues: newArr });
                  }}
                  className="form1 w-32"
                />
                <input
                  placeholder="バリュー"
                  value={kv.value}
                  onChange={(e) => {
                    const newArr = [...formData.keyValues];
                    newArr[index] = { ...newArr[index], value: e.target.value };
                    setFormData({ ...formData, keyValues: newArr });
                  }}
                  className="form1 w-48"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArr = [...formData.keyValues];
                    newArr.splice(index, 1);
                    setFormData({ ...formData, keyValues: newArr });
                  }}
                  className="border border-gray-500 text-gray-500 px-2 rounded"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  keyValues: [...formData.keyValues, { key: '', value: '' }],
                })
              }
              className="border border-gray-500 text-gray-500 px-2 rounded"
            >
              + 追加
            </button>
          </div>

          {success && <p className="text-green-500">登録が完了しました！</p>}
          <div className="flex justify-center">
            <button type="submit" className="edit_b2" disabled={loading}>
              登録
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

export default LicenseNew;
