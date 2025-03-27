import React from 'react';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between bg-white py-4">
      <div className="flex items-center px-4">
        <a href="#/" className="flex items-center">
          {/* SVGロゴ */}
          <img src="/images/aecomkun.svg" alt="Aecomkun" className="w-8 h-8 mr-2" />
          <span className="beesight-red font-bold text-lg">Beesight TOP V2</span>
        </a>
      </div>
      <div className="flex items-center mr-4">
        <span>
          <User size={24} />
        </span>
        {/* <span>ユーザー名</span> */}
      </div>
    </header>
  );
};

export default Header;
