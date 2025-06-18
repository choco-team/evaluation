// usePromptTemplate.ts - 프롬프트 템플릿 관리를 위한 커스텀 훅
import { useState, useEffect } from 'react';
import { useElectron } from '../../common/useElectron';
import { PromptTemplate } from '../../common/types/prompt-template-types';

// 훅의 결과 상태를 위한 인터페이스
export interface OperationResult {
  success: boolean;
  message: string;
}

// 기본 응답 타입
interface TemplateResponse {
  success: boolean;
  data?: PromptTemplate;
  message: string;
}

export function usePromptTemplate() {
  // 일렉트론 IPC 통신 훅 사용
  const { send, receive, removeListener } = useElectron();

  // 상태 관리
  const [template, setTemplate] = useState<PromptTemplate>({
    content: ''
  });
  const [originalTemplate, setOriginalTemplate] = useState<PromptTemplate>({
    content: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [operationResult, setOperationResult] = useState<OperationResult>({
    success: false,
    message: ''
  });

  // 템플릿 로드
  const loadTemplate = (): void => {
    setIsLoading(true);
    setOperationResult({ success: false, message: '' });
    send('load-prompt-template', null);
  };

  // 템플릿 저장
  const saveTemplate = (): void => {
    // 유효성 검사
    if (!template.content.trim()) {
      setOperationResult({ success: false, message: '평가 기준 지시사항을 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    setOperationResult({ success: false, message: '' });
    send('save-prompt-template', template);
  };

  // 템플릿 초기화 (기본값으로 리셋)
  const resetTemplate = (): void => {
    setIsLoading(true);
    setOperationResult({ success: false, message: '' });
    send('reset-prompt-template', null);
  };

  // 템플릿 폴더 열기
  const openTemplateFolder = (): void => {
    setIsLoading(true);
    setOperationResult({ success: false, message: '' });
    send('open-template-folder', null);
  };

  // 템플릿 내용 변경 처리
  const handleContentChange = (content: string): void => {
    const newTemplate = { content };
    setTemplate(newTemplate);
    checkIfModified(newTemplate);
  };

  // 변경사항 확인
  const checkIfModified = (currentTemplate: PromptTemplate): void => {
    const modified = currentTemplate.content !== originalTemplate.content;
    setIsModified(modified);
  };

  // 변경사항 취소
  const cancelChanges = (): void => {
    setTemplate({ ...originalTemplate });
    setIsModified(false);
    setOperationResult({ success: true, message: '변경사항이 취소되었습니다.' });
  };

  // 이벤트 리스너 설정
  useEffect(() => {
    // 템플릿 로드 응답
    const handleLoadResponse = (result: TemplateResponse) => {
      setIsLoading(false);
      if (result.success && result.data) {
        setTemplate(result.data);
        setOriginalTemplate(result.data);
        setIsModified(false);
        setOperationResult({ success: true, message: result.message });
      } else {
        setOperationResult({ success: false, message: result.message });
      }
    };

    // 템플릿 저장 응답
    const handleSaveResponse = (result: TemplateResponse) => {
      setIsLoading(false);
      if (result.success) {
        setOriginalTemplate({ ...template });
        setIsModified(false);
        setOperationResult({ success: true, message: result.message });
      } else {
        setOperationResult({ success: false, message: result.message });
      }
    };

    // 템플릿 초기화 응답
    const handleResetResponse = (result: TemplateResponse) => {
      setIsLoading(false);
      if (result.success && result.data) {
        setTemplate(result.data);
        setOriginalTemplate(result.data);
        setIsModified(false);
        setOperationResult({ success: true, message: result.message });
      } else {
        setOperationResult({ success: false, message: result.message });
      }
    };

    // 폴더 열기 응답
    const handleOpenFolderResponse = (result: TemplateResponse) => {
      setIsLoading(false);
      setOperationResult({ success: result.success, message: result.message });
    };

    // 리스너 등록
    receive('load-prompt-template-response', handleLoadResponse);
    receive('save-prompt-template-response', handleSaveResponse);
    receive('reset-prompt-template-response', handleResetResponse);
    receive('open-template-folder-response', handleOpenFolderResponse);

    // 초기 템플릿 로드
    loadTemplate();

    // 정리 함수
    return () => {
      removeListener('load-prompt-template-response', handleLoadResponse);
      removeListener('save-prompt-template-response', handleSaveResponse);
      removeListener('reset-prompt-template-response', handleResetResponse);
      removeListener('open-template-folder-response', handleOpenFolderResponse);
    };
  }, [send, receive, removeListener]);

  return {
    // 상태
    template,
    isLoading,
    isModified,
    operationResult,

    // 액션
    loadTemplate,
    saveTemplate,
    resetTemplate,
    openTemplateFolder,
    handleContentChange,
    cancelChanges
  };
}
