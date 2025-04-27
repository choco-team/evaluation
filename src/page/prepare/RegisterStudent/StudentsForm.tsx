// StudentForm.tsx - 학생 정보 입력 폼 컴포넌트
import React, { ChangeEvent } from 'react';
import { Student } from '../../../common/types/student';

interface StudentFormProps {
  student: Student;
  index: number;
  canDelete: boolean;
  onInputChange: (index: number, field: keyof Student, value: string) => void;
  onBlur: () => void;
  onRemove: (index: number) => void;
  isLoading?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  student,
  index,
  canDelete,
  onInputChange,
  onBlur,
  onRemove,
  isLoading = false
}) => {
  return (
    <div className="grid-cols-1 sm:grid-cols-2 gap-3 flex">
      <div>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={student.number || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onInputChange(index, 'number', e.target.value)
          }
          onBlur={onBlur}
          placeholder="번호 입력"
          disabled={isLoading}
        />
      </div>

      <div>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={student.name || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onInputChange(index, 'name', e.target.value)
          }
          onBlur={onBlur}
          placeholder="학생명 입력"
          disabled={isLoading}
        />
      </div>
      
      <div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-2 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
            disabled={isLoading}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentForm;