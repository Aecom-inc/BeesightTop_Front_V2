import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

// POST 先: https://85ef-163-44-52-101.ngrok-free.app/api/projects

/**
 * サーバーが受け取るパラメータ
 * "project_name": string,
 * "customer_code": string,
 * "api_key": string,
 * "password": string,
 * "terminal_limit": number,
 * "open_at": string, // "YYYY-MM-DD"
 * "close_at": string, // "YYYY-MM-DD"
 * "status": "activate"|"inactive"|"closed" etc?
 * "type": string,
 * "prefix": string,
 * "description": string
 */

interface ProjectParams {
  name: string;
  customer_code: string;
  api_key: string;
  password: string;
  terminal_limit: number;
  open_at: string; // 2025-01-01
  close_at: string;
  status: string; // e.g., "activate", "inactive", "closed"
  type: string;
  prefix: string;
  description: string;
}

// react-hook-form 用
type ProjectForm = {
  name: string; // プロジェクト名 (入力)
  customer: string; // 顧客コード (入力)
  apikey: string; // APIキー (入力)
  pw: string; // 開発モードPW
  limit: number; // 端末上限
  start: string; // プロジェクト開始日
  end: string; // プロジェクト終了日
  status: string; // ステータス (radio)
  appType: string; // アプリ区分
  prefix: string; // 端末プレフィックス
  note: string; // 補足情報
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
      status: 'activate',
      appType: 'salses',
      prefix: '',
      note: '',
    },
  });

  const onSubmit: SubmitHandler<ProjectForm> = async (data) => {
  // console.log('入力したフォームデータ:', data);
    setLoading(true);
    setError(null);
    setSuccess(false);

    // POST用payload
    const payload: ProjectParams = {
      name: data.name,
      customer_code: data.customer,
      api_key: data.apikey,
      password: data.pw,
      terminal_limit: data.limit,
      open_at: data.start,
      close_at: data.end,
      status: data.status,
      type: data.appType,
      prefix: data.prefix,
      description: data.note,
    };
    // console.log('送信するpayload:', payload);

    try {
      const response = await fetch('https://85ef-163-44-52-101.ngrok-free.app/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('Validation error data:', errorData);
        throw new Error(`プロジェクト登録に失敗しました (ステータス: ${response.status})`);
      }

      const result = await response.json();
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

          {/* 認証モードPW */}
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
                <input type="radio" value="activate" {...register('status')} className="mr-2" />
                activate
              </label>
              <label className="flex items-center">
                <input type="radio" value="inactive" {...register('status')} className="mr-2" />
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
              <option value="1">salses</option>
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

          {/* ボタン */}
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
      {/* フッター */}
      <Footer />
    </div>
  );
};

export default ProjectRegister;
