// StudentActions.tsx - 타입 문제 해결
import React from 'react';
import ExcelUploader from '../RegisterStudent/ExcelUploader';
import { Student } from '../../../common/types/student';

interface StudentActionsProps {
  onAddStudent: () => void;
  onSave: () => void;
  onImport: (data: Student[]) => void;
  isLoading?: boolean;
}

const StudentActions: React.FC<StudentActionsProps> = ({
  onAddStudent,
  onSave,
  onImport,
  isLoading = false
}) => {
  return (
    <div className="flex justify-between mt-4">
      <button
        type="button"
        onClick={onAddStudent}
        onBlur={onSave}
        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 flex items-center gap-x-1.5 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? '처리 중...' : '학생 추가'}
      </button>
      
      {/* 타입 일치시키기 */}
      <ExcelUploader onDataImported={onImport} />
    </div>
  );
};

export default StudentActions;