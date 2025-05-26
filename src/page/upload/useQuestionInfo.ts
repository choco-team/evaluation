// useQuestionInfo.ts - 문제 정보 관리를 위한 커스텀 훅
import { useState, useEffect, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useAnswerSheetStore from '../../common/store/use-answer-sheet-store';
import { usePageStore } from '../../common/store/use-page-store';
import { useElectron } from '../../common/useElectron';
import { decode } from 'he';

export interface Subject {
  name: string;
  uuid: string;
}

export interface SubmitResult {
  success: boolean;
  message: string;
}

export function useQuestionInfo() {
  const {
    content,
    selectedSubject,
    title,
    comment,
    answerSheet,
    correctAnswer,
    questionId,
    setSelectedSubject,
    setComment,
    setContent,
    setTitle,
    setAnswerSheet,
  } = useAnswerSheetStore();
  
  const { setCurrentPage } = usePageStore();
  const { send, receive, removeListener, invoke } = useElectron();
  
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [fileName, setFileName] = useState('파일을 선택해주세요');
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    success: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 일렉트론 IPC 통신 설정
  useEffect(() => {
    const handleSubjectsResponse = (result: { success: boolean; data?: string[]; message: string }) => {
      setIsLoading(false);
      if (result.success && result.data) {
        const subjectsWithId = result.data.map((name: string) => ({
          name,
          uuid: uuidv4(),
        }));
        setSubjectList(subjectsWithId);
      } else {
        setSubmitResult({ success: false, message: result.message });
      }
    };
  
    const handleDocumentResponse = (result: { success: boolean; text?: string; message: string }) => {
      setIsLoading(false);
      if (result.success && result.text) {
        setContent(result.text);
      } else {
        setSubmitResult({ success: false, message: result.message });
      }
    };
  
    const handleSaveResponse = (result: SubmitResult) => {
      setIsLoading(false);
      setSubmitResult(result);
      if (result.success) {
        setAnswerSheet([], []);
        setCurrentPage('prepare');
      }
    };
  
    receive('get-subjects-response', handleSubjectsResponse);
    receive('process-document-response', handleDocumentResponse);
    receive('save-question-response', handleSaveResponse);
  
    fetchSubjectList();
  
    return () => {
      removeListener('get-subjects-response', handleSubjectsResponse);
      removeListener('process-document-response', handleDocumentResponse);
      removeListener('save-question-response', handleSaveResponse);
    };
  }, [send, receive, removeListener]);
  
  // 입력 핸들러
  const handleSubjectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  // 과목 목록 가져오기
  const fetchSubjectList = () => {
    setIsLoading(true);
    send('get-subjects', null);
  };

// 파일 처리
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setFileName(file.name);
  setIsLoading(true);

  try {
    const buffer = await file.arrayBuffer();

    // 👇 여기가 IPC 통신으로 바뀐다
    const result = await invoke('process-document', { buffer });

    if (result.success && result.text) {

      const cleantext:string = decode(result.text)
      .replace(/\^[0-9]+\./g, '')      // ^1. ^2. 이런 숫자 조합 제거
      .replace(/IAA=/g, '')            // IAA= 같은 고정 패턴 제거
      .replace(/&#[0-9]+;/g, ' ')       // &#32; 같은 HTML 엔티티 숫자 치환
      .replace(/[)(^]+/g, ' ');          // )(, (^ 이런 괴상한 기호 묶음은 공백으로
      setContent(cleantext);
      setSubmitResult({ success: true, message: '파일 변환 성공' });
    } else {
      console.error('파일 변환 실패:', result.message);
      setSubmitResult({ success: false, message: result.message || '파일 변환 실패' });
    }
  } catch (err) {
    console.error('파일 변환 에러:', err);
    setSubmitResult({ success: false, message: '파일 변환에 실패했습니다.' });
  } finally {
    setIsLoading(false);
  }
};
  
  // 문제 저장
  const submitQuestionData = () => {
    setIsLoading(true);
    
    const questionData = {
      id: questionId,
      subject: selectedSubject,
      title,
      content,
      comment,
      answerSheet,
      correctAnswer,
      createdAt:new Date(),

    };
    
    send('save-question', questionData);
  };

   const cancelButton = () => {
    setCurrentPage('prepare');
   }

  return {
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
  };
}