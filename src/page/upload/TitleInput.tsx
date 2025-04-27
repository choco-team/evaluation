// TitleInput.tsx - 제목 입력 컴포넌트
import React, { ChangeEvent } from 'react';

interface TitleInputProps {
  value: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const TitleInput: React.FC<TitleInputProps> = ({
  value,
  onChange,
  isLoading = false
}) => {
  return (
    <div>
      <label
        htmlFor="QuestionTitle"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        제목
      </label>
      <input
        value={value || ''}
        onChange={onChange}
        type="text"
        id="QuestionTitle"
        className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="질문 제목을 입력해주세요"
        required
        disabled={isLoading}
      />
    </div>
  );
};

export default TitleInput;