// PromptTemplate.tsx - 메인 프롬프트 템플릿 편집 컴포넌트
import React from 'react';
import { usePromptTemplate } from './usePromptTemplate';
import { TemplateEditor } from './TemplateEditor';
import { TemplateControls } from './TemplateControls';
import { usePageStore } from '../../common/store/use-page-store';

export default function PromptTemplate() {
  const { setCurrentPage } = usePageStore();
  const {
    template,
    isLoading,
    isModified,
    operationResult,
    saveTemplate,
    resetTemplate,
    openTemplateFolder,
    handleContentChange,
    cancelChanges
  } = usePromptTemplate();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        {/* 뒤로 가기 버튼과 제목 */}
        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setCurrentPage('prepare')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            뒤로 가기
          </button>
          <h1 className="text-2xl font-bold text-gray-800">평가 기준 설정</h1>
        </div>
        <p className="text-gray-600">
          학생 평가문 생성에 사용될 기준안을 편집할 수 있습니다.
        </p>
      </div>

      {/* 컨트롤 버튼들 */}
      <TemplateControls
        isLoading={isLoading}
        isModified={isModified}
        onSave={saveTemplate}
        onReset={resetTemplate}
        onOpenFolder={openTemplateFolder}
        onCancel={cancelChanges}
      />

      {/* 상태 메시지 */}
      {operationResult.message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            operationResult.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {operationResult.message}
        </div>
      )}

      <div className="max-w-4xl">
        {/* 템플릿 편집기 */}
        <TemplateEditor
          template={template}
          isLoading={isLoading}
          isModified={isModified}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}
