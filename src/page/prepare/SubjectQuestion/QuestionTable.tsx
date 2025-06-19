// QuestionTable.tsx - 평가항목 목록 테이블 컴포넌트
import React from 'react';
import { EvaluationItem } from '../../../common/types/question-types';

interface QuestionTableProps {
  questions: EvaluationItem[];
  subject: string | null;
  formatDate: (dateString: string) => string;
  onTakeTest: (id: string, subject: string) => void;
  onDirectEvaluate: (id: string, subject: string, evaluationData?: any) => void; // evaluationData 파라미터 추가
  onEdit: (id: string, subject: string) => void;
  onDelete: (question: EvaluationItem) => void;
  isLoading?: boolean;
  page: number
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  subject,
  formatDate,
  onTakeTest,
  onDirectEvaluate,
  onEdit,
  onDelete,
  isLoading = false,
  page
}) => {
  // 평가 타입 표시 함수
  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case 'answer':
        return '답안평가';
      case 'direct':
        return '직접평가';
      default:
        return '알 수 없음';
    }
  };

  // 평가 타입별 배지 스타일
  const getEvaluationTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (type) {
      case 'answer':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'direct':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          {isLoading ? '평가항목을 불러오는 중...' : '평가항목이 없습니다.'}
        </p>
      </div>
    );
  }
  console.log('💬 [QuestionTable] questions:', questions);

const pageSize = 20;
const start = (page - 1) * pageSize;
const end = page * pageSize;
const currentQuestionList = questions.slice(start, end);



  return (
    <div className={`overflow-x-auto ${isLoading ? 'opacity-60' : ''}`}>
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-4 border-b text-left">교과</th>
            <th className="py-2 px-4 border-b text-left">제목</th>
            <th className="py-2 px-4 border-b text-left">평가 타입</th>
            <th className="py-2 px-4 border-b text-left">작성일</th>
            <th className="py-2 px-4 border-b text-center">작업</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => (
            <tr
              key={question.id}
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="py-2 px-4 border-b">
                {subject || question.subject}
              </td>
              <td className="py-2 px-4 border-b font-medium">
                {question.title}
              </td>
              <td className="py-2 px-4 border-b">
                <span className={getEvaluationTypeBadge(question.evaluationType || 'answer')}>
                  {getEvaluationTypeLabel(question.evaluationType || 'answer')}
                </span>
              </td>
              <td className="py-2 px-4 border-b">
                {formatDate(question.createdAt)}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex justify-center space-x-2">
                  {/* 평가 타입에 따른 다른 버튼 표시 */}
                  {(question.evaluationType || 'answer') === 'answer' ? (
                    <button
                      type="button"
                      className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-md hover:bg-purple-200 flex items-center gap-x-1.5"
                      onClick={() => onTakeTest(question.id, question.subject)}
                      disabled={isLoading}
                    >
                      시험
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-md hover:bg-green-200 flex items-center gap-x-1.5"
                      onClick={() => onDirectEvaluate(question.id, question.subject, question)} // question 객체 전체를 전달
                      disabled={isLoading}
                    >
                      입력
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-x-1.5"
                    onClick={() => onEdit(question.id, question.subject)}
                    disabled={isLoading}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 bg-white border border-red-300 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    onClick={() => onDelete(question)}
                    disabled={isLoading}
                  >
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;