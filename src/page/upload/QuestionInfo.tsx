// QuestionInfo.tsx - 리팩토링된 메인 컴포넌트
import React from 'react';
import { useQuestionInfo } from './useQuestionInfo';
import SubjectSelector from './SubjectSelector'
import FileUploader from './FileUploader';
import TitleInput from './TitleInput';
import ContentTextarea from './ContentTextarea';
import SubmitButton from './SubmitButton';
import StatusMessage from './StatusMessage';
import AnswerSheet from './AnswerSheet';


export default function QuestionInfo() {
  const {
    content,
    selectedSubject,
    title,
    comment,
    fileName,
    subjectList,
    submitResult,
    isLoading,
    handleSubjectChange,
    handleContentChange,
    handleTitleChange,
    handleCommentChange,
    handleFileChange,
    submitQuestionData,
    cancelButton
  } = useQuestionInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">평가지 작성하기</h1>

      <form className="space-y-6">
        {/* 과목 선택 */}
        <SubjectSelector
          subjects={subjectList}
          selectedSubject={selectedSubject}
          onChange={handleSubjectChange}
          isLoading={isLoading}
        />

        {/* 제목 */}
        <TitleInput
          value={title}
          onChange={handleTitleChange}
          isLoading={isLoading}
        />

        {/* 파일 업로드 */}
        <FileUploader
          fileName={fileName}
          onFileChange={handleFileChange}
          isLoading={isLoading}
        />

        {/* 내용 작성 */}
        <ContentTextarea
          id="content"
          label="문항 내용"
          placeholder="질문 내용을 자세히 작성해주세요 (HWP 파일을 업로드하면 내용이 자동으로 추출됩니다)"
          value={content}
          onChange={handleContentChange}
          minHeight="200px"
          isRequired={true}
          isLoading={isLoading}
        />

        {/* 보조 내용 */}
        <ContentTextarea
          id="additionalContent"
          label="평가 규칙 등 참고사항"
          placeholder="추가적인 정보나 참고사항을 작성해주세요 (선택사항)"
          value={comment}
          onChange={handleCommentChange}
          minHeight="100px"
          isLoading={isLoading}
        />

        {/* 답안지 설정 */}
        <div>
          <AnswerSheet />
        </div>

    <div className="flex justify-end">

        {/* 제출 버튼 */}
        <SubmitButton 
          onClick={submitQuestionData}
          isLoading={isLoading}
        />
        <button className='px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70' onClick={cancelButton}>취소하기</button>
        
        </div>

        {/* 상태 메시지 */}
        <StatusMessage result={submitResult} />

      </form>
    </div>
  );
}