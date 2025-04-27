// StatusMessage.tsx - 상태 메시지 컴포넌트
import React from 'react';
import { SubmitResult } from './useQuestionInfo';

interface StatusMessageProps {
  result: SubmitResult;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ result }) => {
  if (!result.message) {
    return null;
  }

  return (
    <div
      className={`mt-4 p-2 rounded ${
        result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {result.message}
    </div>
  );
};

export default StatusMessage;