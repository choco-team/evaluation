import React from 'react';
import useAnswerSheetStore from '../../common/store/use-answer-sheet-store';
import AnswerSheetItem from './AnswerSheetItem';
import { QuestionFormat } from '../../common/types/answer-sheet-types';

export default function AnswerSheet() {
  const { answerSheet, addAnswerSheet, removeAnswerSheet } =
    useAnswerSheetStore();
    
  const handleAddQuestion = (format: QuestionFormat) => {
    const counts = format === 'select' ? 4 : undefined;
    addAnswerSheet(format, counts);
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-5">답안 양식 관리</h2>
      
      {answerSheet.length === 0 ? (
        <div className="p-6 text-center border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            등록된 답안 양식이 없습니다. 아래 버튼을 눌러 양식을 추가해주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {answerSheet.map((item, index) => (
            <div key={item.id} className="relative">
              <AnswerSheetItem index={index} id={item.id} />
              <button
                onClick={() => removeAnswerSheet(item.id)}
                className="px-3 py-1.5 border border-red-500 text-red-500 rounded hover:bg-red-50"
                type="button"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 flex space-x-2 mb-6">
        <button
          type="button"
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-x-1.5"
          onClick={() => handleAddQuestion('select')}
        >
          선택형 추가
        </button>
        <button
          type="button"
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-x-1.5"
          onClick={() => handleAddQuestion('input')}
        >
          단답형 추가
        </button>
        <button
          type="button"
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-x-1.5"
          onClick={() => handleAddQuestion('textarea')}
        >
          서술형 추가
        </button>
      </div>
    </div>
  );
}