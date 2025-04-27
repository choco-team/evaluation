// RegisterStudent.tsx - 리팩토링된 메인 컴포넌트
import React from 'react';
import { useStudents } from './useStudents';
import StudentList from './StudentList';
import StudentActions from './StudentAction';
import StatusMessage from './StatusMessage';

export default function RegisterStudent() {
  const {
    students,
    submitResult,
    isLoading,
    addStudent,
    removeStudent,
    handleInputChange,
    handleImportedData,
    saveStudentList
  } = useStudents();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">학생 명단 입력</h1>

      {/* 학생 입력 폼 목록 */}
      <StudentList
        students={students}
        onInputChange={handleInputChange}
        onBlur={saveStudentList}
        onRemove={removeStudent}
        isLoading={isLoading}
      />

      {/* 학생 관리 액션 버튼 */}
      <StudentActions
        onAddStudent={addStudent}
        onSave={saveStudentList}
        onImport={handleImportedData}
        isLoading={isLoading}
      />

      {/* 상태 메시지 */}
      <StatusMessage result={submitResult} />
    </div>
  );
}