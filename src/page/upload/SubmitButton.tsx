// SubmitButton.tsx - 제출 버튼 컴포넌트
import React from 'react';

interface SubmitButtonProps {
  onClick: () => void;
  text?: string;
  isLoading?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  text = '평가지 등록하기',
  isLoading = false
}) => {
  return (
      <button
        type="button"
        onClick={onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
        disabled={isLoading}
      >
        {isLoading ? '처리 중...' : text}
      </button>
  );
};

export default SubmitButton;