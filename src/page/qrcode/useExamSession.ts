import { useEffect, useMemo, useState } from 'react';
import { useElectron } from '../../common/useElectron';
import { useSessionInfoStore } from '../../common/store/use-page-store';
import { useStudentStore } from '../../common/store/studentsStore'; // ✅ zustand store

export function useExamSession() {
  const { send, receive, removeListener, invoke } = useElectron();

  const students = useStudentStore(state => state.students); // ✅ zustand에서 직접 가져옴
  const loadStudents = useStudentStore(state => state.loadStudents); // ← 필요시 사용
  const answerLog = useStudentStore(state => state.answerStatusLog);

  const endpoint = useSessionInfoStore(state => state.endpoint);
  const subject = useSessionInfoStore(state => state.subject);
  const examId = useSessionInfoStore(state => state.examId);

  // 학생 목록이 비어있으면 로딩 시도
  useEffect(() => {
    if (students.length === 0) {
      loadStudents();
    }
  }, [students.length, loadStudents]);

  // 🔍 제출된 학생 번호 Set을 answerLog 기반으로 구함
  const submittedStudents = useMemo(() => {
    return new Set(
      answerLog
        .filter(entry => entry.status === 'missing') // 또는 'found' — 의미에 따라 선택
        .map(entry => entry.studentNumber)
    );
  }, [answerLog]);


  // ✅ SSE 연결 생명주기 관리
  useEffect(() => {
    if (!endpoint || !subject || !examId) {
      console.warn('[ExamSession] SSE 연결 정보 부족');
      return;
    }

    invoke('sse-start', { endpoint, subject, examId });
    console.log('[ExamSession] SSE 시작 요청 전송');

    return () => {
      send('sse-stop', null);
      console.log('[ExamSession] SSE 종료 요청 전송');
    };
  }, [endpoint, subject, examId, send, receive, removeListener]);

  return {
    studentList: students,
    submittedStudents,
  };
}
