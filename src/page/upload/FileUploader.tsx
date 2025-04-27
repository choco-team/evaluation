// FileUploader.tsx - 파일 업로드 컴포넌트
import React, { ChangeEvent, useRef } from 'react';

interface FileUploaderProps {
  fileName: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  fileName,
  onFileChange,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label
        htmlFor="file"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        파일 첨부 (HWP 파일 허용)
      </label>
      <div className="flex items-center">
        <input
          type="file"
          id="file"
          ref={fileInputRef}
          className="hidden"
          accept=".hwp"
          onChange={onFileChange}
          disabled={isLoading}
        />
        <label
          htmlFor="file"
          className={`inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none cursor-pointer ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? '처리 중...' : '파일 선택'}
        </label>
        <span className="ml-3 text-sm text-gray-500 truncate max-w-xs">
          {fileName}
        </span>
      </div>
    </div>
  );
};

export default FileUploader;