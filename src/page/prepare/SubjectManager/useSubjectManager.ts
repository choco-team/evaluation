// useSubjectManager.ts - 비즈니스 로직과 데이터 관리를 담당하는 커스텀 훅
import { useState, useEffect } from 'react';
import { useElectron } from '../../../common/useElectron'; // 일렉트론 훅 임포트

// API 응답 결과를 위한 인터페이스
export interface SubmitResult {
  success: boolean;
  message: string;
}

// API 응답 타입 정의
interface SubjectsResponse {
  success: boolean;
  data?: string[];
  message: string;
}

interface OperationResponse {
  success: boolean;
  message: string;
}

export function useSubjectManager() {
  // 일렉트론 IPC 통신 훅 사용
  const { send, receive, removeListener, invoke } = useElectron();

  // 기본 데이터 상태
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    success: false,
    message: '',
  });

  // 편집 관련 상태
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 교과목 목록 불러오기
  const loadSubjects = (): void => {
    setIsLoading(true);
    // 일렉트론 메인 프로세스에 요청 전송
    send('get-subjects', null);
  };

  // 일렉트론 IPC 통신 핸들러 설정
  useEffect(() => {
    const handleSubjectsResponse = (result: SubjectsResponse) => {
      setIsLoading(false);
      if (result.success && result.data) {
        setSubjects(result.data);
        setSubmitResult({ success: true, message: '' });
      } else {
        setSubmitResult({ success: false, message: result.message });
      }
    };
  
    const handleOperationResponse = (result: OperationResponse) => {
      setIsLoading(false);
      setSubmitResult(result);
  
      if (result.success) {
        loadSubjects();
      }
    };
  
    receive('get-subjects-response', handleSubjectsResponse);
    receive('add-subject-response', handleOperationResponse);
    receive('update-subject-response', handleOperationResponse);
    receive('delete-subject-response', handleOperationResponse);
  
    loadSubjects();
  
    return () => {
      removeListener('get-subjects-response', handleSubjectsResponse);
      removeListener('add-subject-response', handleOperationResponse);
      removeListener('update-subject-response', handleOperationResponse);
      removeListener('delete-subject-response', handleOperationResponse);
    };
  }, [send, receive, removeListener]);
  
  // 교과목 추가 함수
  const addNewSubject = (): void => {
    // 이미 편집 중이면 추가 불가
    if (isEditing) return;

    // 기본 이름으로 새 교과목 추가
    const defaultName = '새 교과';

    // "새 교과목"이라는 이름이 이미 있는지 확인
    const existingNewSubject = subjects.find(
      (subject) => subject === defaultName,
    );

    if (existingNewSubject) {
      // 이미 "새 교과목"이 있으면 해당 교과목을 편집 모드로 설정
      setIsEditing(true);
      setEditingSubject(defaultName);
      setNewSubject(defaultName);

      // 성공 메시지 표시
      setSubmitResult({
        success: true,
        message: "'새 교과'가 이미 존재합니다. 이름을 변경해주세요.",
      });

      return;
    }

    // 편집 상태 시작
    setIsEditing(true);

    // 로컬 UI 즉시 업데이트 (낙관적 UI 업데이트)
    const updatedSubjects = [...subjects, defaultName];
    setSubjects(updatedSubjects);

    // 새 과목을 편집 모드로 설정
    setEditingSubject(defaultName);
    setNewSubject(defaultName);

    // 일렉트론 메인 프로세스에 요청 전송
    setIsLoading(true);
    send('add-subject', { name: defaultName });
  };

  // 교과목 삭제 함수
  const removeSubject = (subjectToRemove: string): void => {
    // 로컬 UI 즉시 업데이트 (낙관적 UI 업데이트)
    setSubjects(subjects.filter((subject) => subject !== subjectToRemove));

    // 편집 중이었다면 편집 취소 및 편집 상태 종료
    if (editingSubject === subjectToRemove) {
      setEditingSubject(null);
      setNewSubject(null);
      setIsEditing(false);
    }

    // 선택되어 있었다면 선택 취소
    if (selectedSubject === subjectToRemove) {
      setSelectedSubject(null);
    }

    // 일렉트론 메인 프로세스에 삭제 요청 전송
    setIsLoading(true);
    send('delete-subject', { name: subjectToRemove });
  };

  // 교과목 이름 변경 입력 처리
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewSubject(e.target.value);
  };

  // 편집 모드 시작
  const startEditing = (subject: string): void => {
    // 이미 다른 항목 편집 중이면 무시
    if (isEditing && editingSubject !== subject) return;

    setIsEditing(true);
    setEditingSubject(subject);
    setNewSubject(subject);
  };

  // 편집 모드 취소
  const cancelEditing = (): void => {
    setEditingSubject(null);
    setNewSubject(null);
    setIsEditing(false);
  };

  // 교과목 선택 (상세 정보 보기)
  const toggleSubjectSelection = (subject: string): void => {
    // 편집 중일 때는 선택 변경 방지
    if (isEditing) return;

    setSelectedSubject(subject === selectedSubject ? null : subject);
  };

  // 편집 완료 처리
  const completeEditing = (): void => {
    if (editingSubject && newSubject) {
      // 빈 이름은 허용하지 않음
      if (newSubject.trim() === '') {
        setSubmitResult({ success: false, message: '교과명을 입력해주세요.' });
        return;
      }

      // 이름이 변경되지 않았으면 편집 모드만 종료
      if (editingSubject === newSubject) {
        cancelEditing();
        return;
      }

      // 일렉트론 메인 프로세스에 업데이트 요청 전송
      setIsLoading(true);
      send('update-subject', {
        selected: editingSubject,
        name: newSubject
      });
      
      // 편집 모드 종료 (응답은 이벤트 리스너에서 처리)
      cancelEditing();
    } else {
      // 유효하지 않은 입력이면 편집 모드만 종료
      cancelEditing();
    }
  };

  // 이미 '새 교과목'이 존재하는지 확인
  const newSubjectExists = subjects.includes('새 교과');


    const handleEvaluation = async (subjectName: string) => {
    if (!subjectName) throw new Error('과목 정보가 없습니다')
    setIsLoading(true);
    try{
     const result = await invoke(`get-subject-prompt`, {subject: subjectName})
     if (!result) alert('평가를 위한 프롬프트 생성 중 오류가 발생하였습니다')
      alert('프롬프트 생성에 성공했습니다 프롬프트 파일 저장경로로 이동합니다')
     const success = await invoke(`open-folder`, null);
     if (!success){
      alert('해당 위치를 찾을 수 없습니다')
     }
    return result
    }
    catch (error) {
      alert(error)
    }

  }




  return {
    // 상태
    subjects,
    selectedSubject,
    submitResult,
    editingSubject,
    newSubject,
    isEditing,
    isLoading,
    newSubjectExists,
    
    // 액션
    loadSubjects,
    addNewSubject,
    removeSubject,
    handleNameInputChange,
    startEditing,
    cancelEditing,
    toggleSubjectSelection,
    completeEditing,
    handleEvaluation
  };
}