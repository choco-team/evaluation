import { useState, useEffect } from 'react';
import { usePageStore, useSessionInfoStore } from '../../../common/store/use-page-store';
import useAnswerSheetStore from '../../../common/store/use-answer-sheet-store';
import { useElectron } from '../../../common/useElectron';
import { fetchExamData, registerSessionToServer } from './question-api';
import { formatDate} from './question-utils';
import {
  handleQuestionListResponse,
  handleQuestionEditResponse,
  handleDeleteResponse,
  handleExamResponse
} from './question-listeners';
import { Question, OperationResult } from '../../../common/types/question-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;  // 여기서 읽고 넘김

export function useQuestion(subject: string | null, initialPage: number = 1) {
  const { send, receive, removeListener, invoke } = useElectron();
  const { setSelectedSubject, setTitle, setComment, setContent, setAnswerSheet, setQuestionId } = useAnswerSheetStore();
  const { setCurrentPage } = usePageStore();

  const [page, setPage] = useState<number>(initialPage);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [operationResult, setOperationResult] = useState<OperationResult>({ success: false, message: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);

// ✅ 컴포넌트 or 훅 최상단에서 한 번만 호출
const setEndpoint = useSessionInfoStore(state => state.setEndpoint);
const setQrcodeLink = useSessionInfoStore(state => state.setQrcodeLink);
const setSubject = useSessionInfoStore(state => state.setSubject);
const setExamId = useSessionInfoStore(state => state.setExamId);




  const getQuestionList = () => {
    setIsLoading(true);
    send('get-question-list', { page, subject });
  };

  const getQuestionForEdit = (id: string) => {
    setIsLoading(true);
    send('get-question-edit', { id, subject });
  };

  const deleteQuestion = (id: string) => {
    if (window.confirm('정말로 이 평가지를 삭제하시겠습니까?')) {
      setIsLoading(true);
      send('delete-question', { id, subject });
    }
  };


  const handleTakeTest = async (id: string, subjectName: string) => {
    if (!subjectName) {
      setOperationResult({ success: false, message: '교과를 선택하세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const examData = await fetchExamData(invoke ,id, subjectName);
      const sessionKey = await registerSessionToServer(invoke, API_BASE_URL, examData); // API_BASE_URL 넘김
      const qrUrl = API_BASE_URL + '/evaluation/exam/' + sessionKey;
      const sseUrl =API_BASE_URL + '/evaluation/sse/' + sessionKey;;

      setEndpoint(sseUrl);
      setQrcodeLink(qrUrl);
      setSubject(subjectName);
      setExamId(id);

      setOperationResult({ success: true, message: '시험 준비 완료!' });
      setCurrentPage('QrCode');
    } catch (error) {
      console.error('시험 시작 오류:', error);
      setOperationResult({ success: false, message: '시험 시작에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => { if (page > 1) setPage(page - 1); };
  const handleNextPage = () => { setPage(page + 1); };
  const handleEdit = (id: string) => { getQuestionForEdit(id); };
  const handleDelete = (id: string) => { deleteQuestion(id); };
  const handleCreate = () => {
    setSelectedSubject('');
    setAnswerSheet([], []);
    setComment('');
    setTitle(null);
    setContent(null);
    setQuestionId(undefined);
    setCurrentPage('WritingPage');
  };

  useEffect(() => {
    const onList = (result: any) =>
      handleQuestionListResponse(result, setQuestions, setOperationResult, setIsLoading);
    const onExam = (result: any) =>
      handleExamResponse(result, send, setOperationResult, setIsLoading);
    const onEdit = (result: any) =>
      handleQuestionEditResponse(result, setSelectedSubject, setTitle, setComment, setContent, setAnswerSheet, setQuestionId, setCurrentPage, setOperationResult, setIsLoading);
    const onDelete = (result: any) =>
      handleDeleteResponse(result, getQuestionList, setOperationResult, setIsLoading);
  
    receive('get-question-list-response', onList);
    receive('get-exam-response', onExam);
    receive('get-question-edit-response', onEdit);
    receive('delete-question-response', onDelete);
  
    getQuestionList();
  
    return () => {
      removeListener('get-question-list-response', onList);
      removeListener('get-exam-response', onExam);
      removeListener('get-question-edit-response', onEdit);
      removeListener('delete-question-response', onDelete);
    };
  }, [page, subject]);
  
  return {
    page,
    questions,
    operationResult,
    isLoading,
    handlePrevPage,
    handleNextPage,
    handleTakeTest,
    handleEdit,
    handleDelete,
    handleCreate,
    formatDate
  };
}
