// Pagination.tsx - 페이지네이션 컴포넌트
import React from 'react';

interface PaginationProps {
  page: number;
  itemCount: number;
  pageSize?: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  itemCount,
  pageSize = 20,
  onPrevPage,
  onNextPage,
  isLoading = false
}) => {
  return (
    <div className="mt-4 flex justify-between items-center">
      <div>
        <span className="text-sm text-gray-600">
          총 {itemCount}개 평가지
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPrevPage}
          disabled={page <= 1 || isLoading}
        >
          이전
        </button>
        <span className="px-4 py-2 bg-gray-100 rounded">
          페이지 {page}
        </span>
        <button
          type="button"
          className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNextPage}
          disabled={itemCount < pageSize || isLoading}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;