
// SubjectManager.tsx - 메인 컴포넌트
import React from 'react';
import { useSubjectManager } from './useSubjectManager';
import { SubjectGrid } from './SubjectGrid';
import SubjectQuestion from './../SubjectQuestion/SubjectQuestion';

export default function SubjectManager() {
  const {
    subjects,
    selectedSubject,
    submitResult,
    editingSubject,
    newSubject,
    isEditing,
    isLoading,
    newSubjectExists,
    
    addNewSubject,
    removeSubject,
    handleNameInputChange,
    startEditing,
    cancelEditing,
    toggleSubjectSelection,
    completeEditing,
    handleEvaluation
  } = useSubjectManager();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">교과 관리</h1>

      <div className="mb-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-x-1.5"
          onClick={addNewSubject}
          disabled={isEditing || isLoading}
        >
          {isLoading ? '처리 중...' : (newSubjectExists ? '새 교과 수정하기' : '교과 추가')}
        </button>
      </div>

      <SubjectGrid
        subjects={subjects}
        selectedSubject={selectedSubject}
        editingSubject={editingSubject}
        newSubject={newSubject}
        isEditing={isEditing}
        isLoading={isLoading}
        onToggleSelection={toggleSubjectSelection}
        onStartEditing={startEditing}
        onCompleteEditing={completeEditing}
        onRemove={removeSubject}
        onNameChange={handleNameInputChange}
        handleEvaluation={handleEvaluation}
      />

      <SubjectQuestion subject={selectedSubject} initialPage={1} />

      {submitResult.message && (
        <div
          className={`mt-4 p-2 rounded ${submitResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {submitResult.message}
        </div>
      )}
    </div>
  );
}