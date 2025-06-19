// useDirectEvaluation.ts - 직접평가 관리를 위한 커스텀 훅
import { useState, useEffect } from 'react';
import { useStudentStore } from '../../common/store/studentsStore';
import { usePageStore } from '../../common/store/use-page-store';
import { useElectron } from '../../common/useElectron';
import { DirectEvaluationResult } from '../../common/types/question-types';

export interface EvaluationFormData {
  studentNumber: number;
  studentName: string;
  result: string;
  score: number | undefined; // null 대신 undefined 사용
}

export interface SubmitResult {
  success: boolean;
  message: string;
}

export function useDirectEvaluation(evaluationId: string, subject: string, title: string) {
  const { students } = useStudentStore();
  const { setCurrentPage } = usePageStore();
  const { invoke } = useElectron(); // send, receive, removeListener 제거
  
  const [evaluationData, setEvaluationData] = useState<EvaluationFormData[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    success: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false); // 데이터 로드 완료 플래그

  // 기존 평가 데이터 로드 함수
  const loadExistingEvaluations = async () => {
    // 이미 로딩 중이거나 데이터가 로드되었으면 중복 호출 방지
    if (isLoading || isDataLoaded) {
      console.log('[useDirectEvaluation] 중복 호출 방지 - isLoading:', isLoading, 'isDataLoaded:', isDataLoaded);
      return;
    }
    
    console.log('[useDirectEvaluation] 기존 평가 데이터 로드 시작 - evaluationId:', evaluationId, 'subject:', subject);
    setIsLoading(true);
    
    try {
      // invoke로 직접 호출 (ipcMain.handle과 호환)
      const result = await invoke('load-direct-evaluation', { evaluationId, subject });
      console.log('[useDirectEvaluation] 백엔드 응답 받음:', result);
      
      setIsLoading(false);
      setIsDataLoaded(true);
      
      if (result.success) {
        if (result.data && result.data.length > 0) {
          console.log('[useDirectEvaluation] 기존 평가 데이터 로드:', result.data.length + '건');
          setEvaluationData(prevData => prevData.map(item => {
            const saved = result.data?.find(d => d.studentNumber === item.studentNumber);
            return saved ? {
              ...item,
              result: saved.result,
              score: saved.score || undefined,
            } : item;
          }));
          setSubmitResult({ success: true, message: '기존 평가 데이터를 불러왔습니다.' });
        } else {
          console.log('[useDirectEvaluation] 기존 평가 데이터 없음, 새로 시작');
          setSubmitResult({ success: true, message: '새로운 직접평가를 시작합니다.' });
        }
      } else {
        console.error('[useDirectEvaluation] 로드 실패:', result.message);
        setSubmitResult({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('[useDirectEvaluation] 로드 중 오류:', error);
      setIsLoading(false);
      setIsDataLoaded(true);
      setSubmitResult({ success: false, message: '데이터 로드 중 오류가 발생했습니다.' });
    }
  };

  // 학생 목록 변경 시 스마트하게 평가 데이터 업데이트
  useEffect(() => {
    if (students.length > 0) {
      setEvaluationData(prevData => {
        // 기존 평가 데이터를 studentNumber로 매핑
        const existingDataMap = new Map(
          prevData.map(item => [item.studentNumber, item])
        );
        
        // 현재 학생 목록에 맞춰 평가 데이터 생성
        const updatedData: EvaluationFormData[] = students.map(student => {
          const studentNumber = student.number || 0;
          const existingData = existingDataMap.get(studentNumber);
          
          // 기존 데이터가 있으면 유지, 없으면 새로 생성
          return existingData || {
            studentNumber,
            studentName: student.name || '',
            result: '',
            score: undefined,
          };
        });
        
        return updatedData;
      });
      
      // 학생 목록이 로드된 후 기존 평가 데이터 로드 (아직 로드되지 않은 경우에만)
      if (!isDataLoaded) {
        loadExistingEvaluations();
      }
    }
  }, [students, isDataLoaded]);

  // 일렉트론 IPC 통신 설정 제거 (invoke 방식으로 변경)
  // useEffect 제거됨

  // 초기 데이터 로드
  useEffect(() => {
    if (students.length === 0) {
      // 학생이 없으면 로딩 비활성화
      console.log('[useDirectEvaluation] 학생이 없어 로딩 비활성화');
      setIsLoading(false);
      setIsDataLoaded(true);
    } else if (!isDataLoaded) {
      // 학생이 있고 데이터가 로드되지 않았으면 로드 시도
      console.log('[useDirectEvaluation] 학생이 있어 데이터 로드 시도');
      loadExistingEvaluations();
    }
  }, [students.length, isDataLoaded]);

  // 개별 학생 평가 데이터 업데이트
  const updateStudentEvaluation = (studentNumber: number, field: 'result' | 'score', value: string | number) => {
    setEvaluationData(prev => prev.map(item => 
      item.studentNumber === studentNumber 
        ? { ...item, [field]: field === 'score' ? (value === '' ? undefined : Number(value)) : value }
        : item
    ));
  };

  // 전체 저장 (invoke 방식으로 변경)
  const saveEvaluations = async () => {
    // 비어있지 않은 평가만 필터링
    const validEvaluations = evaluationData.filter(item => 
      item.result.trim() !== '' || item.score !== undefined
    );

    if (validEvaluations.length === 0) {
      setSubmitResult({ success: false, message: '평가 내용을 입력해주세요.' });
      return;
    }

    setIsSaving(true);
    
    try {
      const saveData: DirectEvaluationResult[] = validEvaluations.map(item => ({
        evaluationId,
        studentNumber: item.studentNumber,
        studentName: item.studentName,
        result: item.result,
        score: item.score,
        createdAt: new Date().toISOString(),
      }));

      console.log('[useDirectEvaluation] 저장 요청:', saveData.length + '건', 'subject:', subject);
      const result = await invoke('save-direct-evaluation', { subject, evaluations: saveData });
      console.log('[useDirectEvaluation] 저장 응답:', result);
      
      setIsSaving(false);
      setSubmitResult(result);
      
      if (result.success) {
        // 성공 시 준비 페이지로 돌아가기
        setTimeout(() => {
          setCurrentPage('prepare');
        }, 2000);
      }
    } catch (error) {
      console.error('[useDirectEvaluation] 저장 중 오류:', error);
      setIsSaving(false);
      setSubmitResult({ success: false, message: '저장 중 오류가 발생했습니다.' });
    }
  };

  // 취소 버튼
  const cancelEvaluation = () => {
    setCurrentPage('prepare');
  };

  // 전체 선택/해제
  const clearAllEvaluations = () => {
    setEvaluationData(prev => prev.map(item => ({
      ...item,
      result: '',
      score: undefined, // null 대신 undefined
    })));
  };

  // 데이터 리셋 (에러 시 또는 재로드용)
  const resetDataLoadStatus = () => {
    setIsDataLoaded(false);
    setIsLoading(false);
  };

  // 통계 정보
  const getStats = () => {
    const completed = evaluationData.filter(item => item.result.trim() !== '').length;
    const total = evaluationData.length;
    const withScore = evaluationData.filter(item => item.score !== undefined).length;
    
    return { completed, total, withScore };
  };

  return {
    evaluationData,
    submitResult,
    isLoading,
    isSaving,
    isDataLoaded,
    updateStudentEvaluation,
    saveEvaluations,
    cancelEvaluation,
    clearAllEvaluations,
    resetDataLoadStatus,
    getStats,
  };
}