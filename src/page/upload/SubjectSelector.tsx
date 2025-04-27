// SubjectSelector.tsx - 과목 선택 컴포넌트
import React, { ChangeEvent } from 'react';
import { Subject } from './useQuestionInfo';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubject: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  isLoading?: boolean;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedSubject,
  onChange,
  isLoading = false
}) => {
  return (
    <div>
      <label
        htmlFor="subject"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        과목 선택
      </label>
      <select
        id="subject"
        className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={selectedSubject}
        onChange={onChange}
        required
        disabled={isLoading}
      >
        <option value="" disabled>
          과목을 선택해주세요
        </option>
        {subjects.map((subject) => (
          <option key={subject.uuid} value={subject.name}>
            {subject.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectSelector;