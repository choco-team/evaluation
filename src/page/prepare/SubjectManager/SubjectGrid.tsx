// SubjectGrid.tsx - 교과목 그리드 컴포넌트
import React from 'react';
import { SubjectCard } from './SubjectCard';

interface SubjectGridProps {
  subjects: string[];
  selectedSubject: string | null;
  editingSubject: string | null;
  newSubject: string | null;
  isEditing: boolean;
  isLoading: boolean;
  onToggleSelection: (subject: string) => void;
  onStartEditing: (subject: string) => void;
  onCompleteEditing: () => void;
  onRemove: (subject: string) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  subjects,
  selectedSubject,
  editingSubject,
  newSubject,
  isEditing,
  isLoading,
  onToggleSelection,
  onStartEditing,
  onCompleteEditing,
  onRemove,
  onNameChange
}) => {
  if (subjects.length === 0) {
    return (
      <div className="text-gray-500 my-4">
        {isLoading ? '교과 목록을 불러오는 중...' : '등록된 교과가 없습니다.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject}
          subject={subject}
          isSelected={selectedSubject === subject}
          isEditing={isEditing}
          isEditingThis={editingSubject === subject}
          isLoading={isLoading}
          newSubject={newSubject}
          onToggleSelection={onToggleSelection}
          onStartEditing={onStartEditing}
          onCompleteEditing={onCompleteEditing}
          onRemove={onRemove}
          onNameChange={onNameChange}
        />
      ))}
    </div>
  );
};