import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../components/footer';
import { useForm, SubmitHandler } from 'react-hook-form';

// ★ 追加
import api from '../services/api';

// react-hook-form 用の型
type ProjectForm = {
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
};

// サーバーに送るデータ形 (本来サーバー仕様に合わせる)
interface ProjectPayload {
  name: string;
  customer_code: string;
  api_key: string;
  password: string;
  terminal_limit: number;
  open_at: string;
  close_at: string;
  status: string;
  type: string | number;
  prefix: string;
  description: string;
}

function ProjectEdit() {
  const { project_id } = useParams<{ project_id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectForm>({
    defaultValues: {
      name: '',
      customer_code: '',
      api_key: '',
      password: '',
      terminal_limit: 0,
      open_at: '',
      close_at: '',
      status: 'active',
      type: '1',
      prefix: '',
      description: '',
    },
  });

  // ① GET /projects/:id → データ取得
  useEffect(() => {
    const fetchProject = async () => {
      if (!project_id) {
        setError('project_id がありません');
        setLoading(false);
        return;
      }
      try {
        // ★ fetch → api.projects.getProjectById
        const result = await api.projects.getProjectById(project_id);
        if (!result.success || !result.data) {
          throw new Error(result.message || 'プロジェクト詳細の取得に失敗しました');
        }

        const p = result.data;
        // 取得したデータを react-hook-form に反映
        reset({
          name: p.name || '',
          customer_code: p.customer_code || '',
          api_key: p.api_key || '',
          password: p.password || '',
          terminal_limit: p.terminal_limit || 0,
          // 'YYYY-MM-DD HH:mm:ss' → 'YYYY-MM-DD'
          open_at: p.open_at?.split(' ')[0] || '',
          close_at: p.close_at?.split(' ')[0] || '',
          status: p.status || 'active',
          type: String(p.type ?? '1'),
          prefix: p.prefix || '',
          description: p.description || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [project_id, reset]);

  // ② PUT /projects/:id → 更新
  const onSubmit: SubmitHandler<ProjectForm> = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!project_id) {
        throw new Error('project_id がありません');
      }
      // サーバー仕様に合わせて再構成
      const payload: ProjectPayload = {
        name: data.name,
        customer_code: data.customer_code,
        api_key: data.api_key,
        password: data.password,
        terminal_limit: data.terminal_limit,
        open_at: data.open_at,
        close_at: data.close_at,
        status: data.status,
        type: data.type, // 文字列か数値かはサーバー側の定義に合わせる
        prefix: data.prefix,
        description: data.description,
      };
      console.log('PUT送信payload:', payload);

      // ★ fetch → api.projects.updateProject
      const result = await api.projects.updateProject(project_id, payload);
      console.log('更新結果:', result);

      if (!result.success) {
        throw new Error(result.message || 'プロジェクト更新に失敗しました');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || '更新時にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="beesight-r">{error}</p>;

  return (
    <div>
      <h1 className="title1">プロジェクト編集</h1>

      <div className="editform">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* name */}
          <div>
            <label className="lavel-text">
              プロジェクト名<span className="beesight-red ">※</span>
            </label>
            <input {...register('name', { required: 'プロジェクト名は必須です' })} className="form1 w-full" />
            {errors.name && <p className="error-red">{errors.name.message}</p>}
          </div>

          {/* customer_code */}
          <div>
            <label className="lavel-text">
              顧客コード<span className="beesight-red ">※</span>
            </label>
            <input {...register('customer_code', { required: '顧客コードは必須です' })} className="form1 w-full" />
            {errors.customer_code && <p className="error-red">{errors.customer_code.message}</p>}
          </div>

          {/* api_key */}
          <div>
            <label className="lavel-text">
              API Key<span className="beesight-red ">※</span>
            </label>
            <input {...register('api_key', { required: 'API Keyは必須です' })} className="form1 w-full" />
            {errors.api_key && <p className="error-red">{errors.api_key.message}</p>}
          </div>

          {/* password */}
          <div>
            <label className="lavel-text">
              開発モードPW<span className="beesight-red ">※</span>
            </label>
            <input {...register('password', { required: '開発モードPWは必須です' })} className="form1 w-full" />
            {errors.password && <p className="error-red">{errors.password.message}</p>}
          </div>

          {/* terminal_limit */}
          <div>
            <label className="lavel-text">
              端末上限<span className="beesight-red ">※</span>
            </label>
            <input
              type="number"
              {...register('terminal_limit', {
                required: '端末上限は必須です',
                valueAsNumber: true,
                min: { value: 1, message: '1以上で指定してください' },
              })}
              className="form1 w-20"
            />
            <span className="ml-2">件</span>
            {errors.terminal_limit && <p className="error-red">{errors.terminal_limit.message}</p>}
          </div>

          {/* open_at */}
          <div>
            <label className="lavel-text">
              プロジェクト開始日<span className="beesight-red ">※</span>
            </label>
            <input type="date" {...register('open_at', { required: '開始日は必須です' })} className="form1 w-1/3" />
            {errors.open_at && <p className="error-red">{errors.open_at.message}</p>}
          </div>

          {/* close_at */}
          <div>
            <label className="lavel-text">プロジェクト終了日</label>
            <input type="date" {...register('close_at')} className="form1 w-1/3" />
          </div>

          {/* status */}
          <div>
            <label className="lavel-text">
              ステータス<span className="beesight-red ">※</span>
            </label>
            <select {...register('status', { required: 'ステータスは必須です' })} className="form1 w-1/3">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="closed">closed</option>
            </select>
            {errors.status && <p className="error-red">{errors.status.message}</p>}
          </div>

          {/* type */}
          <div>
            <label className="lavel-text">
              アプリ区分<span className="beesight-red ">※</span>
            </label>
            <select {...register('type', { required: 'アプリ区分は必須です' })} className="form1 w-1/3">
              <option value="1">salses</option>
              <option value="2">rent</option>
              <option value="3">demo</option>
              <option value="4">development</option>
            </select>
            {errors.type && <p className="error-red">{errors.type.message}</p>}
          </div>

          {/* prefix */}
          <div>
            <label className="lavel-text">
              端末プレフィックス<span className="beesight-red ">※</span>
            </label>
            <input {...register('prefix', { required: '端末プレフィックスは必須です' })} className="form1 w-full" />
            {errors.prefix && <p className="error-red">{errors.prefix.message}</p>}
          </div>

          {/* description */}
          <div>
            <label className="lavel-text">備考、メモ</label>
            <textarea {...register('description')} className="form1 w-full" rows={3} />
          </div>

          {success && <p className="text-green-500">更新されました！</p>}
          {error && <p className="error-red">{error}</p>}

          <div className="flex justify-center gap-4">
            <button type="reset" className="delete_b2">
              リセット
            </button>
            <button type="submit" className="edit_b2">
              更新
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
}

export default ProjectEdit;
