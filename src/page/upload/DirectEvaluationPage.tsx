// DirectEvaluationPage.tsx - 직접평가 입력 메인 페이지
import React, { useEffect } from 'react';
import { useStudentStore } from '../../common/store/studentsStore';
import { useDirectEvaluation } from './useDirectEvaluation';
import DirectEvaluationForm from './DirectEvaluationForm';

interface DirectEvaluationPageProps {
  evaluationId: string;
  subject: string;
  title: string;
  description?: string;
}

const DirectEvaluationPage: React.FC<DirectEvaluationPageProps> = ({
  evaluationId,
  subject,
  title,
  description,
}) => {
  const { students, loadStudents } = useStudentStore();
  
  const {
    evaluationData,
    submitResult,
    isLoading,
    isSaving,
    updateStudentEvaluation,
    saveEvaluations,
    cancelEvaluation,
    clearAllEvaluations,
    getStats,
  } = useDirectEvaluation(evaluationId, subject, title);

  // 페이지 로드 시 학생 목록 가져오기
  useEffect(() => {
    if (students.length === 0) {
      loadStudents();
    }
  }, [students.length, loadStudents]);

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                  직접평가
                </span>
                <span className="text-sm text-gray-500">{subject}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-gray-600">{description}</p>
              )}
            </div>
            
            {/* 상단 통계 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stats.completed}/{stats.total}
              </div>
              <div className="text-sm text-gray-500">평가 완료</div>
            </div>
          </div>
        </div>

        {/* 안내 정보 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <h3 className="font-medium mb-1">직접평가 입력 안내</h3>
              <ul className="space-y-1 text-blue-700">
                <li>• 실기 수행 과정, 발표 내용, 참여도 등을 간단히 메모해주세요</li>
                <li>• 점수는 선택사항이며, 빠른 입력 버튼을 활용할 수 있습니다</li>
                <li>• 평가 내용은 최종 평가문 생성 시 참고자료로 활용됩니다</li>
                <li>• 저장 후에도 언제든 수정할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 학생 목록 로딩 상태 */}
        {students.length === 0 && !isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">학생 목록이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              직접평가를 진행하려면 먼저 학생을 등록해야 합니다.
            </p>
            <button
              onClick={cancelEvaluation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              학생 등록하러 가기
            </button>
          </div>
        )}

        {/* 평가 폼 */}
        {students.length > 0 && (
          <DirectEvaluationForm
            evaluationData={evaluationData}
            submitResult={submitResult}
            isLoading={isLoading}
            isSaving={isSaving}
            onUpdateStudent={updateStudentEvaluation}
            onSave={saveEvaluations}
            onCancel={cancelEvaluation}
            onClearAll={clearAllEvaluations}
            stats={stats}
          />
        )}
      </div>
    </div>
  );
};

export default DirectEvaluationPage;