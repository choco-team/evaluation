// TemplateControls.tsx - 템플릿 컨트롤 버튼들 컴포넌트
import React from 'react';

interface TemplateControlsProps {
  isLoading: boolean;
  isModified: boolean;
  onSave: () => void;
  onReset: () => void;
  onOpenFolder: () => void;
  onCancel: () => void;
}

export const TemplateControls: React.FC<TemplateControlsProps> = ({
  isLoading,
  isModified,
  onSave,
  onReset,
  onOpenFolder,
  onCancel
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
      {/* 주요 액션 버튼들 */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isLoading || !isModified}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            isModified && !isLoading
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'border border-gray-300 bg-white text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || !isModified}
          className={`px-4 py-2 border border-gray-300 rounded-md font-medium transition-colors ${
            isModified && !isLoading
              ? 'bg-white text-gray-700 hover:bg-gray-50'
              : 'bg-white text-gray-400 cursor-not-allowed'
          }`}
        >
          취소
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 bg-white text-red-600 rounded-md hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          기본값으로 초기화
        </button>
      </div>


    </div>
  );
};
