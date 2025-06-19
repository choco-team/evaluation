// DirectEvaluationForm.tsx - 직접평가 전체 폼 컴포넌트
import React from 'react';
import StudentEvaluationItem from './StudentEvaluationItem';
import StatusMessage from './StatusMessage';
import { EvaluationFormData, SubmitResult } from './useDirectEvaluation';

interface DirectEvaluationFormProps {
  evaluationData: EvaluationFormData[];
  submitResult: SubmitResult;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateStudent: (studentNumber: number, field: 'result' | 'score', value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  onClearAll: () => void;
  stats: {
    completed: number;
    total: number;
    withScore: number;
  };
}

const DirectEvaluationForm: React.FC<DirectEvaluationFormProps> = ({
  evaluationData,
  submitResult,
  isLoading,
  isSaving,
  onUpdateStudent,
  onSave,
  onCancel,
  onClearAll,
  stats,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">기존 평가 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (evaluationData.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">등록된 학생이 없습니다.</p>
        <p className="text-sm text-gray-500">
          먼저 학생을 등록해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상태 메시지 */}
      {submitResult.message && (
        <StatusMessage 
          result={submitResult}
        />
      )}

      {/* 진행 상황 및 도구 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* 진행 상황 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                평가 진행률: 
                <span className="ml-2 font-semibold text-blue-600">
                  {stats.completed}/{stats.total} ({Math.round((stats.completed / stats.total) * 100)}%)
                </span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* 점수 입력 현황 */}
            <div className="text-sm text-gray-600">
              점수 입력: 
              <span className="ml-2 font-semibold text-green-600">
                {stats.withScore}/{stats.total}
              </span>
            </div>
          </div>

          {/* 도구 버튼 */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClearAll}
              disabled={isSaving}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              전체 초기화
            </button>
          </div>
        </div>
      </div>

      {/* 학생별 평가 입력 */}
      <div className="grid gap-4">
        {evaluationData.map((student) => (
          <StudentEvaluationItem
            key={student.studentNumber}
            studentNumber={student.studentNumber}
            studentName={student.studentName}
            result={student.result}
            score={student.score}
            onResultChange={(value) => onUpdateStudent(student.studentNumber, 'result', value)}
            onScoreChange={(value) => onUpdateStudent(student.studentNumber, 'score', value)}
            isDisabled={isSaving}
          />
        ))}
      </div>

      {/* 저장/취소 버튼 */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          {stats.completed > 0 && (
            <span>
              <strong>{stats.completed}명</strong>의 평가가 입력되었습니다.
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || stats.completed === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSaving ? '저장 중...' : '평가 저장'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectEvaluationForm;