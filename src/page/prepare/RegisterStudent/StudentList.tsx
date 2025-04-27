// StudentList.tsx - 학생 목록 컴포넌트
import React from 'react';
import { Student } from '../../../common/types/student';
import StudentsForm from './StudentsForm';

interface StudentListProps {
  students: Student[];
  onInputChange: (index: number, field: keyof Student, value: string) => void;
  onBlur: () => void;
  onRemove: (index: number) => void;
  isLoading?: boolean;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  onInputChange,
  onBlur,
  onRemove,
  isLoading = false
}) => {
  return (
    <div className="space-y-4">
      {students.map((student, index) => (
        <StudentsForm
          key={index}
          student={student}
          index={index}
          canDelete={students.length > 1}
          onInputChange={onInputChange}
          onBlur={onBlur}
          onRemove={onRemove}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default StudentList;