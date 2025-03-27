import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// APIの基本URL
const API_BASE_URL = 'https://8585-163-44-52-101.ngrok-free.app/api';

// 型定義
interface LoginResponse {
  token: string;
}

// Axiosインスタンスの設定
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    Accept: 'application/json',
  },
});

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // トークンの期限切れなどでの401エラー処理
    if (error.response && error.response.status === 401) {
      // ローカルストレージからトークンを削除
      localStorage.removeItem('token');
      // ログインページにリダイレクト
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    // console.log(token);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

//--------------------------------------
// ★認証関連のAPI
//--------------------------------------
export const authService = {
  login: async (loginId: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', {
      login_id: loginId,
      password,
    });
    return response.data;
  },
  logout: async (): Promise<void> => {
    const response = await apiClient.post('/logout');
    localStorage.removeItem('token');
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/user');
    return response.data;
  },
};

//--------------------------------------
// ★プロジェクト関連のAPI
//--------------------------------------
export interface Project {
  project_id: number;
  name: string;
  api_key: string;
  status: string;
  activated_count: number;
  terminal_limit: number;
  open_at: string;
  close_at: string;
  description: string;
}

export interface ProjectData {
  id: number;
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
  activated_count: number;
}

interface ProjectDetailResponse {
  success: boolean;
  message?: string;
  data?: ProjectData;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number;
  to: number;
  links: PaginationLink[];
}

// プロジェクト一覧APIのレスポンス例
interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project[];
  pagination?: PaginationData;
}

export interface ProjectCreateResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Device {
  terminal_id: string;
  name: string;
  alias: string | null;
  project_name: string;
  serial_no: string;
  os: string;
  os_ver: string;
  description: string | null;
  app: {
    app_id: number;
    name: string;
    description: string | null;
  };
}

export interface AuthHistory {
  auth_history_id: string;
  project_id: number;
  project_name: string;
  api_key: string;
  terminal_id: string;
  terminal_name: string;
  serial_no: string;
  action: string;
  result: string;
  auth_msg: string;
  app_id: number;
  app_name: string;
  app_version: string;
  authenticate_at: string;
}

export const projectService = {
  //　プロジェクト取得
  getProjects: async (page: number): Promise<ProjectResponse> => {
    const response = await apiClient.get<ProjectResponse>(`/projects?page=${page}`);
    return response.data;
  },

  //　プロジェクト削除
  deleteProject: async (projectId: number): Promise<ProjectResponse> => {
    const response = await apiClient.delete<ProjectResponse>(`/projects/${projectId}`);
    return response.data;
  },

  // プロジェクト単体取得
  getProjectById: async (projectId: string): Promise<ProjectDetailResponse> => {
    const response = await apiClient.get<ProjectDetailResponse>(`/projects/${projectId}`);
    return response.data; // { success, data: {...}, message?:... }
  },

  // プロジェクト更新
  updateProject: async (projectId: string, payload: any): Promise<ProjectDetailResponse> => {
    const response = await apiClient.put<ProjectDetailResponse>(`/projects/${projectId}`, payload);
    return response.data; // { success, message, data?:... }
  },

  // プロジェクト新規登録 (POST /projects)
  createProject: async (payload: any): Promise<ProjectCreateResponse> => {
    const response = await apiClient.post<ProjectCreateResponse>('/projects', payload);
    return response.data; // { success, message, data?: ... }
  },

  // terminals 一覧取得 (GET /projects/:id/terminals)
  getTerminalsByProjectId: async (projectId: string, page: number): Promise<any> => {
    return apiClient
      .get(`/projects/${projectId}/terminals`, {
        params: { page },
      })
      .then((res) => res.data);
  },

  // 認証履歴一覧 (GET /projects/:id/auth/histories)
  getAuthHistoriesByProjectId: async (projectId: string, page: number): Promise<any> => {
    const response = await apiClient.get(`/projects/${projectId}/auth/histories`, {
      params: { page },
    });
    return response.data; // { success, data, pagination, ... } を想定
  },
};

//--------------------------------------
// ★ユーザー関連のAPI
//--------------------------------------
export interface User {
  user_id: string;
  name: string;
  email: string;
}

interface UsersResponse {
  success: boolean;
  message?: string;
  data: User[];
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<UsersResponse>('/users');
    return response.data.data;
  },
};

//--------------------------------------
// ★履歴関連のAPI
//--------------------------------------
export const historyService = {
  getHistories: async (limit: number): Promise<any> => {
    const response = await apiClient.get('/auth/histories', {
      params: { limit },
    });
    return response.data; // 返却データ例: { success: true, data: [...], ... }
  },
};

//--------------------------------------
// ★ライセンス関連のAPI
//--------------------------------------
export const licenseService = {
  // ライセンス一覧取得
  getAllLicenses: async (): Promise<any> => {
    const response = await apiClient.get('/licenses');
    return response.data;
  },

  // ライセンス削除
  deleteLicense: async (licenseId: number): Promise<any> => {
    const response = await apiClient.delete(`/licenses/${licenseId}`);
    return response.data;
  },

  // ライセンス単体取得 (GET /licenses/:id)
  getLicenseById: async (licenseId: string): Promise<any> => {
    const response = await apiClient.get(`/licenses/${licenseId}`);
    return response.data;
  },

  // ライセンス更新 (PUT /licenses/:id)
  updateLicense: async (licenseId: string, payload: any): Promise<any> => {
    const response = await apiClient.put(`/licenses/${licenseId}`, payload);
    return response.data;
  },

  // ライセンス新規作成 (POST /licenses)
  createLicense: async (payload: any): Promise<any> => {
    const response = await apiClient.post('/licenses', payload);
    return response.data;
  },
};

//--------------------------------------
// ★アプリ関連のAPI
//--------------------------------------
export interface AppLicense {
  license_id: number;
  name: string;
}
export interface AppData {
  app_id: number;
  name: string;
  version: string;
  description: string | null;
  status: string;
  licenses: AppLicense[];
}
interface AppResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: any;
}

export const appService = {
  // アプリ一覧取得
  getApps: async (): Promise<AppData[]> => {
    const response = await apiClient.get<AppResponse>('/apps');
    if (!response.data.success) {
      throw new Error(response.data.message || 'アプリ一覧の取得に失敗しました');
    }
    return response.data.data;
  },

  // アプリ単体取得 (編集時など)
  getAppById: async (appId: string): Promise<AppResponse> => {
    const response = await apiClient.get(`/apps/${appId}`);
    return response.data; // { success:boolean, message?:string, data?:AppData }
  },

  // アプリ新規登録
  createApp: async (payload: any): Promise<AppResponse> => {
    const response = await apiClient.post('/apps', payload);
    return response.data; // { success:boolean, message?:string, data?:any }
  },

  // アプリ更新
  updateApp: async (appId: string, payload: any): Promise<AppResponse> => {
    const response = await apiClient.put(`/apps/${appId}`, payload);
    return response.data; // { success:boolean, message?:string, data?:any }
  },

  // アプリ削除
  deleteApp: async (appId: number): Promise<void> => {
    const response = await apiClient.delete(`/apps/${appId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'アプリ削除に失敗しました');
    }
  },
};

//--------------------------------------
// ★承認履歴関係のAPI
//--------------------------------------
export const authHistoryService = {
  getHistories: async (page: number, search: string) => {
    const response = await apiClient.get('/auth/histories', {
      params: {
        page,
        search,
      },
    });
    return response.data;
  },
};


export default {
  auth: authService,
  projects: projectService,
  users: userService,
  histories: historyService,
  license: licenseService,
  app: appService,
  authHistory: authHistoryService,
};
