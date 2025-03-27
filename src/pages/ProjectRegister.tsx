import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

// ★ 追加
import api from '../services/api';

// POST 先: /api/projects
interface ProjectParams {
  name: string;
  customer_code: string;
  api_key: string;
  password: string;
  terminal_limit: number;
  open_at: string;
  close_at: string;
  status: string;
  type: string;
  prefix: string;
  description: string;
}

// react-hook-form 用 (フォーム入力項目)
type ProjectForm = {
  name: string; // プロジェクト名
  customer: string; // 顧客コード
  apikey: string; // APIキー
  pw: string; // PW
  limit: number; // 端末上限
  start: string; // 開始日
  end: string; // 終了日
  status: string; // ラジオの選択
  appType: string; // セレクトボックス
  prefix: string; // 端末プレフィックス
  note: string; // 備考
};

const ProjectRegister: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectForm>({
    defaultValues: {
      name: '',
      customer: '',
      apikey: '',
      pw: '',
      limit: 3,
      start: '2025-01-01',
      end: '2025-12-31',
      status: 'active',
      appType: '1', // "1"="sales" としている例
      prefix: '',
      note: '',
    },
  });

  // ★ 1) onSubmit
  const onSubmit: SubmitHandler<ProjectForm> = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 送信ペイロードをサーバー仕様に合わせる
    const payload: ProjectParams = {
      name: formData.name,
      customer_code: formData.customer,
      api_key: formData.apikey,
      password: formData.pw,
      terminal_limit: formData.limit,
      open_at: formData.start,
      close_at: formData.end,
      status: formData.status,
      type: formData.appType,
      prefix: formData.prefix,
      description: formData.note,
    };

    try {
      // ★ fetch → api.projects.createProject に変更
      const result = await api.projects.createProject(payload);
      console.log('登録結果:', result);

      if (!result.success) {
        throw new Error(result.message || 'プロジェクト登録に失敗しました');
      }
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title1">プロジェクト登録</h1>
      <div className="editform">
        {loading && <p className="text-gray-500">登録処理中...</p>}
        {error && <p className="error-red">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* プロジェクト名 */}
          <div>
            <label className="lavel-text">
              プロジェクト名<span className="beesight-red ">※</span>
            </label>
            <input
              {...register('name', { required: 'プロジェクト名は必須です' })}
              className="form1 w-full"
              placeholder="プロジェクト名を入力"
            />
            {errors.name && <p className="error-red">{errors.name.message}</p>}
          </div>

          {/* 顧客コード */}
          <div>
            <label className="lavel-text">
              顧客コード<span className="beesight-red ">※</span>
            </label>
            <input
              {...register('customer', { required: '顧客コードは必須です' })}
              className="form1 w-full"
              placeholder="顧客コードを入力"
            />
            {errors.customer && <p className="error-red">{errors.customer.message}</p>}
          </div>

          {/* API Key */}
          <div>
            <label className="lavel-text">
              API Key<span className="beesight-red ">※</span>
            </label>
            <input
              {...register('apikey', { required: 'API Keyは必須です' })}
              className="form1 w-full"
              placeholder="API Keyを入力"
            />
            {errors.apikey && <p className="error-red">{errors.apikey.message}</p>}
          </div>

          {/* 開発モードPW */}
          <div>
            <label className="lavel-text">
              開発モードPW<span className="beesight-red ">※</span>
            </label>
            <input
              {...register('pw', { required: '認証モードパスワードは必須です' })}
              type="password"
              className="form1 w-full"
              placeholder="開発モードパスワードを入力"
            />
            {errors.pw && <p className="error-red">{errors.pw.message}</p>}
          </div>

          {/* 端末上限 */}
          <div>
            <label className="lavel-text">
              端末上限<span className="beesight-red ">※</span>
            </label>
            <input
              type="number"
              {...register('limit', { required: '端末上限は必須です', valueAsNumber: true, min: 1 })}
              className="form1 w-20"
            />
            <span className="ml-2">件</span>
            {errors.limit && <p className="error-red">{errors.limit.message}</p>}
          </div>

          {/* プロジェクト開始日 */}
          <div>
            <label className="lavel-text">
              プロジェクト開始日<span className="beesight-red">※</span>
            </label>
            <input
              type="date"
              {...register('start', { required: 'プロジェクト開始日は必須です' })}
              className="form1 w-1/3"
            />
            {errors.start && <p className="error-red">{errors.start.message}</p>}
          </div>

          {/* プロジェクト終了日  */}
          <div>
            <label className="lavel-text">プロジェクト終了日</label>
            <input type="date" {...register('end')} className="form1 w-1/3" />
          </div>

          {/* ステータス */}
          <div>
            <label className="lavel-text">
              ステータス<span className="beesight-red">※</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="active" {...register('status')} className="mr-2" />
                active
              </label>
              <label className="flex items-center">
                <input type="radio" value="inactive  " {...register('status')} className="mr-2" />
                inactive
              </label>
              <label className="flex items-center">
                <input type="radio" value="closed" {...register('status')} className="mr-2" />
                closed
              </label>
            </div>
          </div>

          {/* アプリ区分 */}
          <div>
            <label className="lavel-text">
              アプリ区分<span className="beesight-red ">※</span>
            </label>
            <select {...register('appType', { required: 'アプリ区分は必須です' })} className="form1 w-1/3">
              <option value="1">sales</option>
              <option value="2">rent</option>
              <option value="3">demo</option>
              <option value="4">development</option>
            </select>
            {errors.appType && <p className="error-red">{errors.appType.message}</p>}
          </div>

          {/* 端末プレフィックス */}
          <div>
            <label className="lavel-text">
              端末プレフィックス<span className="beesight-red ">※</span>
            </label>
            <input
              {...register('prefix', { required: '端末プレフィックスは必須です' })}
              className="form1 w-full"
              placeholder="端末プレフィックス"
            />
            {errors.prefix && <p className="error-red">{errors.prefix.message}</p>}
          </div>

          {/* 補足情報 */}
          <div>
            <label className="lavel-text">備考、メモ</label>
            <textarea {...register('note')} className="form1 w-full" placeholder="備考やメモ" />
          </div>

          {success && <p className="text-green-500">プロジェクトが登録されました！</p>}
          <div className="flex justify-center gap-4">
            <button type="reset" className="delete_b2">
              リセット
            </button>
            <button type="submit" className="edit_b2">
              登録
            </button>
          </div>
          <div className="flex justify-center">
            <Link to="/project_list" className="button2 mb-5 w-full">
              戻る
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectRegister;
