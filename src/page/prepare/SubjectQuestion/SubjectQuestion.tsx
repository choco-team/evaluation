// SubjectQuestion.tsx - 평가항목 관리 메인 컴포넌트
import React, { useState } from 'react';
import { useQuestion } from './useQuestion';
import { usePageStore } from '../../../common/store/use-page-store'; // 페이지 스토어 추가
import QuestionTable from './QuestionTable';
import Pagination from './Pagination';
import OperationResult from './QuestionResult';

// 컴포넌트 props 인터페이스
interface SubjectQuestionProps {
  subject: string | null;
  initialPage?: number;
}

export default function SubjectQuestion({ subject, initialPage = 1 }: SubjectQuestionProps) {
  // 페이지 스토어와 평가항목 생성 모달 상태
  const { setCurrentPage } = usePageStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 커스텀 훅을 통한 비즈니스 로직 분리
  const {
    page,
    questions: evaluations, // evaluations로 이름 변경
    operationResult,
    isLoading,
    handlePrevPage,
    handleNextPage,
    handleTakeTest,
    handleEdit,
    handleDelete,
    handleCreate,
    formatDate
  } = useQuestion(subject, initialPage);

  // 직접평가 처리 함수 (새로 추가)
  const handleDirectEvaluate = (id: string, questionSubject: string, evaluationData?: any) => {
    console.log('직접평가 시작 - 전달받은 데이터:', evaluationData);
    
    setCurrentPage('DirectEvaluationPage', {
      evaluationId: id,
      subject: questionSubject,
      title: evaluationData?.title || '직접평가',
      description: evaluationData?.comment || ''
    });
  };

  // 평가항목 생성 타입 선택 함수
  const handleCreateEvaluation = (type: 'answer' | 'direct') => {
    console.log('평가항목 생성:', type);
    setShowCreateModal(false);
    
    if (type === 'answer') {
      // 기존 답안평가 생성 로직
      handleCreate();
    } else {
      // 직접평가 생성: 전용 페이지로 이동
      setCurrentPage('DirectEvaluationCreator');
    }
  };

  return (
    <div className="w-full">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{subject} 평가항목 목록</h2>
        <div className="relative">
          <button 
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70" 
            onClick={() => setShowCreateModal(!showCreateModal)}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '평가항목 작성'}
          </button>
          
          {/* 드롭다운 메뉴 */}
          {showCreateModal && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => handleCreateEvaluation('answer')}
                >
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <span>답안평가 작성</span>
                  </div>
                  <span className="text-xs text-gray-500">(시험 형태)</span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => handleCreateEvaluation('direct')}
                >
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <span>직접평가 작성</span>
                  </div>
                  <span className="text-xs text-gray-500">(교사 입력)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 평가항목 타입 안내 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <strong>답안평가:</strong> 학생들이 시험을 보고 답안을 제출하는 형태의 평가
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <strong>직접평가:</strong> 실기, 발표 등 교사가 직접 관찰하여 평가하는 형태
          </div>
        </div>
      </div>

      {/* 작업 결과 메시지 */}
      <OperationResult result={operationResult} />

      {/* 평가항목 목록 테이블 */}
      <QuestionTable
      questions={evaluations}
      subject={subject}
      formatDate={formatDate}
      onTakeTest={handleTakeTest}
      onDirectEvaluate={handleDirectEvaluate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isLoading={isLoading}
      page={page}
      />

      {/* 평가항목이 있을 경우에만 페이지네이션 표시 */}
      {evaluations.length > 0 && (
        <Pagination
          page={page}
          itemCount={evaluations.length}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          isLoading={isLoading}
        />
      )}

      {/* 모달 배경 클릭 시 닫기 */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}