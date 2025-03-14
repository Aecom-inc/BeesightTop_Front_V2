import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  // 検索クエリが変わった時に呼ばれるコールバック
  onSearch: (query: string) => void;
  // 「検索」ボタンを押した時に呼ばれるコールバック (必要に応じて)
  onSubmitSearch?: (query: string) => void;
  // プレースホルダの文言などをカスタマイズしたい場合
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onSubmitSearch, placeholder = '検索' }) => {
  const [query, setQuery] = useState('');

  // 入力が変わるたびに onSearch() を呼ぶ
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  // 「検索」ボタンを押したときに必要な動作があれば
  const handleClickSearch = () => {
    if (onSubmitSearch) {
      onSubmitSearch(query);
    } else {
      // もし特に必要なければやらなくてもOK
      // ここで何か処理してもよい
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-end">
        <label htmlFor="search" className="sr-only">
          検索
        </label>
        <div className="search1">
          <input type="text" id="search" placeholder={placeholder} value={query} onChange={handleChange} />
          <span>
            <Search size={20} />
          </span>
        </div>
        <button className="button1" onClick={handleClickSearch}>
          検索
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
