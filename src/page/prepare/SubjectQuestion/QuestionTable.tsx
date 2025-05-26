// QuestionTable.tsx - 평가지 목록 테이블 컴포넌트
import React from 'react';
import { Question } from '../../../common/types/question-types';

interface QuestionTableProps {
  questions: Question[];
  subject: string | null;
  formatDate: (dateString: string) => string;
  onTakeTest: (id: string, subject: string) => void;
  onEdit: (id: string) => void;
  onDelete: (question: Question) => void;
  isLoading?: boolean;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  subject,
  formatDate,
  onTakeTest,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          {isLoading ? '평가지를 불러오는 중...' : '평가지가 없습니다.'}
        </p>
      </div>
    );
  }
  console.log('💬 [QuestionTable] questions:', questions);


  return (
    <div className={`overflow-x-auto ${isLoading ? 'opacity-60' : ''}`}>
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-2 px-4 border-b text-left">교과</th>
            <th className="py-2 px-4 border-b text-left">제목</th>
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
                {formatDate(question.createdAt)}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-300 rounded-md hover:bg-purple-200 flex items-center gap-x-1.5"
                    onClick={() => onTakeTest(question.id, question.subject)}
                    disabled={isLoading}
                  >
                    시험
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-x-1.5"
                    onClick={() => onEdit(question.id)}
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