import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileClock, PackageSearch, Copyright, UsersIcon,Apple } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {/* HOME */}
          <li>
            <Link to="/">
              <span>
                <Home size={24} />
              </span>
              <p>HOME</p>
            </Link>
          </li>
          {/* 認証履歴 */}
          <li>
            <Link to="/history">
              <span>
                <FileClock size={24} />
              </span>
              <p>認証履歴</p>
            </Link>
          </li>
          {/* プロジェクト一覧 */}
          <li>
            <Link to="/project_list">
              <span>
                <PackageSearch size={24} />
              </span>
              <p>プロジェクト一覧</p>
            </Link>
          </li>
          {/* プロジェクト登録 */}
          {/* <li>
            <Link to="/project_register">
              <span>
                <PackagePlus size={24} />
              </span>
              <p>プロジェクト登録</p>
            </Link>
          </li> */}
          {/* 外部ライセンス一覧 */}
          <li>
            <Link to="/licenses">
              <span>
                <Copyright size={24} />
              </span>
              <p>外部ライセンス一覧</p>
            </Link>
          </li>
          <li>
            <Link to="/apps">
              <span>
                <Apple size={24} />
              </span>
              <p>アプリ一覧</p>
            </Link>
          </li>
          <li>
            <Link to="/users">
              <span>
                <UsersIcon size={24} />
              </span>
              <p>ユーザー一覧</p>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
