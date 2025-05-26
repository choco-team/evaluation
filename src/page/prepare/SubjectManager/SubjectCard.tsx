import React, { KeyboardEvent, MouseEvent } from 'react';

interface SubjectCardProps {
  subject: string;
  isSelected: boolean;
  isEditing: boolean;
  isEditingThis: boolean;
  isLoading: boolean;
  newSubject: string | null;
  onToggleSelection: (subject: string) => void;
  onStartEditing: (subject: string) => void;
  onCompleteEditing: () => void;
  onRemove: (subject: string) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEvaluation: (subject:string) => void;

}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isSelected,
  isEditing,
  isEditingThis,
  isLoading,
  newSubject,
  onToggleSelection,
  onStartEditing,
  onCompleteEditing,
  onRemove,
  onNameChange,
  handleEvaluation
}) => {
  return (
    <div
      className={`border rounded-lg p-3 shadow-sm transition-colors 
        ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
        ${isEditing && !isEditingThis ? 'opacity-50' : ''}
        ${subject === '새 교과' ? 'border-blue-400 bg-blue-50' : ''}
        ${isLoading ? 'opacity-70' : ''}`}
    >
<div
  onClick={() => {
    if (subject.trim() !== '') {  // ★ subject가 비어있지 않을 때만
      onToggleSelection(subject);
    }
  }}
  className="cursor-pointer mb-2"
>
        {isEditingThis ? (
          <input
            type="text"
            value={newSubject || ''}
            onChange={onNameChange}
            className="w-full p-1 border rounded"
            placeholder="교과명 입력"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                onCompleteEditing();
              }
            }}
            onClick={(e: MouseEvent<HTMLInputElement>) => e.stopPropagation()}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.stopPropagation();
              onCompleteEditing();
            }}
            disabled={isLoading}
          />
        ) : (
          <div className="text-center py-1">
            {subject || (
              <span className="text-gray-400">교과명이 없음</span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2 mt-2 text-sm border-t pt-2">
        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (isEditingThis) {
              onCompleteEditing();
            } else {
              onStartEditing(subject);
            }
          }}
          className="text-blue-500 hover:text-blue-700"
          disabled={(isEditing && !isEditingThis) || isLoading}
        >
          {isEditingThis ? '완료' : '수정'}
        </button>

        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleEvaluation(subject);
          }}
          className="text-green-500 hover:text-green-700"
          disabled={(isEditing && !isEditingThis) || isLoading}
        >
          평가
        </button>


        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onRemove(subject);
          }}
          className="text-red-500 hover:text-red-700"
          disabled={(isEditing && !isEditingThis) || isLoading}
        >
          삭제
        </button>
      </div>
    </div>
  );
};