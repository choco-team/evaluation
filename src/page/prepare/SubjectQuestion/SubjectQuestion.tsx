// SubjectQuestion.tsx - 타입 수정된 메인 컴포넌트
import React from 'react';
import { useQuestion } from './useQuestion';
import QuestionTable from './QuestionTable';
import Pagination from './Pagination';
import OperationResult from './QuestionResult';

// 컴포넌트 props 인터페이스
interface SubjectQuestionProps {
  subject: string | null;
  initialPage?: number;
}

export default function SubjectQuestion({ subject, initialPage = 1 }: SubjectQuestionProps) {
  // 커스텀 훅을 통한 비즈니스 로직 분리
  const {
    page,
    questions,
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

  return (
    <div className="w-full">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{subject} 평가지 목록</h2>
        <button 
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70" 
          onClick={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '평가지 작성'}
        </button>
      </div>

      {/* 작업 결과 메시지 */}
      <OperationResult result={operationResult} />

      {/* 평가지 목록 테이블 */}
      <QuestionTable
        questions={questions}
        subject={subject}
        formatDate={formatDate}
        onTakeTest={handleTakeTest}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* 질문이 있을 경우에만 페이지네이션 표시 */}
      {questions.length > 0 && (
        <Pagination
          page={page}
          itemCount={questions.length}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}