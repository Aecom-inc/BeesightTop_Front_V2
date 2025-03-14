import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Laravelのページネーション構造を想定
interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationData {
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

// コールバック: ページが変更された時に呼び出す
interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void; // 親コンポーネント側でPage番号に応じたfetchを行う
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  // 前へボタン
  const handlePrev = () => {
    if (pagination.current_page > 1) {
      onPageChange(pagination.current_page - 1);
    }
  };

  // 次へボタン
  const handleNext = () => {
    if (pagination.current_page < pagination.last_page) {
      onPageChange(pagination.current_page + 1);
    }
  };

  // ページ番号をクリック
  const handlePageNumber = (pageNum: number) => {
    onPageChange(pageNum);
  };

  return (
    <div className="pagenation_box">
      <span>
        {pagination.total}件中 {pagination.from}件〜{pagination.to}件
      </span>
      <div className="pagenations">
        {/* 前へボタン */}
        <button disabled={!pagination.prev_page_url} onClick={handlePrev}>
          <ChevronLeft />
        </button>

        {/* リンクリストのうち、数字のラベルだけを表示 */}
        {pagination.links
          .filter((link) => {
            // 「« Previous」「Next »」などは除外
            return !(link.label === '&laquo; Previous' || link.label === 'Next &raquo;');
          })
          .map((link, i) => {
            // label が数字の場合のみクリック可能
            const isNumber = /^\d+$/.test(link.label);
            const pageNum = isNumber ? Number(link.label) : null;

            return (
              <button
                key={i}
                disabled={!isNumber}
                className={link.active ? 'pagenations_red' : ''}
                onClick={() => {
                  if (pageNum) handlePageNumber(pageNum);
                }}
              >
                {link.label}
              </button>
            );
          })}

        {/* 次へボタン */}
        <button disabled={!pagination.next_page_url} onClick={handleNext}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
