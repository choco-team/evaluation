// TemplateEditor.tsx - 템플릿 편집 컴포넌트
import React from 'react';
import { PromptTemplate } from '../../common/types/prompt-template-types';

interface TemplateEditorProps {
  template: PromptTemplate;
  isLoading: boolean;
  isModified: boolean;
  onContentChange: (content: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  isLoading,
  isModified,
  onContentChange
}) => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="mb-6 flex flex-wrap gap-3 items-center justify-start">
        <h2 className="text-lg font-semibold">템플릿 편집</h2>
        {isModified && (
          <span className="text-sm text-orange-600 font-medium">
            * 변경사항 있음
          </span>
        )}
      </div>



      {/* 템플릿 내용 편집 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          평가 기준 설정
        </label>
        <textarea
          value={template.content}
          onChange={(e) => onContentChange(e.target.value)}
          className={`w-full h-[500px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm
            ${isModified ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          placeholder="평가 기준을 입력하세요..."
          disabled={isLoading}
        />
      </div>

      {/* 도움말 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 평가 기준 지시사항에 각 학생의 답안 정보와 함께 결합되어 최종적으로 평가 프롬프트가 생성됩니다.</p>
        <p>• 글자 수 제한이 필요하다면 평가 기준 프롬프트에 직접 명시하세요.</p>
        <p>• 변경사항이 있을 때는 반드시 저장해주세요.</p>
      </div>
    </div>
  );
};
