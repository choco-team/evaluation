// StudentEvaluationItem.tsx - 개별 학생 평가 입력 컴포넌트
import React from 'react';

interface StudentEvaluationItemProps {
  studentNumber: number;
  studentName: string;
  result: string;
  score: number | undefined; // null 대신 undefined
  onResultChange: (value: string) => void;
  onScoreChange: (value: string) => void;
  isDisabled?: boolean;
}

const StudentEvaluationItem: React.FC<StudentEvaluationItemProps> = ({
  studentNumber,
  studentName,
  result,
  score,
  onResultChange,
  onScoreChange,
  isDisabled = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 학생 정보 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
            {studentNumber}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{studentName}</h3>
            <p className="text-sm text-gray-500">{studentNumber}번</p>
          </div>
        </div>
        {/* 완료 상태 표시 */}
        <div className="flex items-center space-x-2">
          {result.trim() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              평가 완료
            </span>
          )}
          {score !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              점수: {score}점
            </span>
          )}
        </div>
      </div>

      {/* 평가 내용 입력 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            평가 내용 *
          </label>
          <textarea
            value={result}
            onChange={(e) => onResultChange(e.target.value)}
            disabled={isDisabled}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
            rows={4}
            placeholder="실기 수행 과정, 발표 내용, 참여도 등을 자세히 기록해주세요..."
          />
        </div>

        {/* 점수 입력 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              점수 (선택사항)
            </label>
            <div className="relative">
              <input
                type="number"
                value={score || ''}
                onChange={(e) => onScoreChange(e.target.value)}
                disabled={isDisabled}
                className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="점수"
                min="0"
                max="100"
              />
              <span className="absolute right-2 top-2 text-gray-400 text-sm">점</span>
            </div>
          </div>
          
          {/* 빠른 점수 버튼 */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">빠른 입력</label>
            <div className="flex space-x-1">
              {[90, 80, 70, 60].map((quickScore) => (
                <button
                  key={quickScore}
                  type="button"
                  onClick={() => onScoreChange(quickScore.toString())}
                  disabled={isDisabled}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  {quickScore}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 글자 수 표시 */}
      <div className="mt-2 text-right">
        <span className={`text-xs ${result.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
          {result.length}/500자
        </span>
      </div>
    </div>
  );
};

export default StudentEvaluationItem;