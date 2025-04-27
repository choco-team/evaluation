// ContentTextarea.tsx - 내용 작성 텍스트 영역 컴포넌트
import React, { ChangeEvent } from 'react';

interface ContentTextareaProps {
  value: string | null;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  placeholder: string;
  id: string;
  minHeight?: string;
  isRequired?: boolean;
  isLoading?: boolean;
}

const ContentTextarea: React.FC<ContentTextareaProps> = ({
  value,
  onChange,
  label,
  placeholder,
  id,
  minHeight = '200px',
  isRequired = false,
  isLoading = false
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        className={`w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        style={{ minHeight }}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        required={isRequired}
        disabled={isLoading}
      />
    </div>
  );
};

export default ContentTextarea;