import React from 'react';
import { AuthProvider } from './contexts/AuthContext';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Header from './components/header';
import Sidebar from './components/sidebar';

import Login from './components/Login.tsx';
import Dashboard from './pages/Dashboard';
import LicenseList from './pages/LicenseList';
import LicenseEdit from './pages/LicenseEdit';
import LicenseRegister from './pages/LicenseRegister';
import AuthHistory from './pages/AuthHistory';
import ProjectList from './pages/ProjectList';
import ProjectRegister from './pages/ProjectRegister';
import ProjectEdit from './pages/ProjectEdit.tsx';
import ProjectDetail from './pages/ProjectDetail';
import UserList from './pages/UserList';
import UserRegister from './pages/UserRegister';
import UserEdit from './pages/UserEdit';
import AppList from './pages/AppList';
import AppRegister from './pages/AppRegister';
import AppEdit from './pages/AppEdit';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-100">
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<AuthHistory />} />

                <Route path="/licenses" element={<LicenseList />} />
                <Route path="/licenses/edit/:license_id" element={<LicenseEdit />} />
                <Route path="/licenses/new" element={<LicenseRegister />} />

                <Route path="/project_list" element={<ProjectList />} />
                <Route path="/project_register" element={<ProjectRegister />} />
                <Route path="/projects/edit/:project_id" element={<ProjectEdit />} />
                <Route path="/project/:project_id" element={<ProjectDetail />} />

                <Route path="/users" element={<UserList />} />
                <Route path="/users/new" element={<UserRegister />} />
                <Route path="/users/edit:user_id" element={<UserEdit />} />

                <Route path="/apps" element={<AppList />} />
                <Route path="/apps/new" element={<AppRegister />} />
                <Route path="/apps/edit/:app_id" element={<AppEdit />} />

                <Route path="*" element={<p className="text-red-500">ページが見つかりません</p>} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

// `#app` に ReactDOM で描画
const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(<App />);
