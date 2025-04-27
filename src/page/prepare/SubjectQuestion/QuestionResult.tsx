// OperationResult.tsx - 작업 결과 메시지 컴포넌트
import React from 'react';
import { OperationResult as OperationResultType } from '../../../common/types/question-types';

interface OperationResultProps {
  result: OperationResultType;
}

const OperationResult: React.FC<OperationResultProps> = ({ result }) => {
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

export default OperationResult;