import { useEffect, useState } from 'react';
import { useElectron } from '../../common/useElectron';
import { useSessionInfoStore } from '../../common/store/use-page-store';
import { useStudentStore } from '../../common/store/studentsStore'; // ✅ zustand store

export function useExamSession() {
  const { send, receive, removeListener, invoke } = useElectron();

  const students = useStudentStore(state => state.students); // ✅ zustand에서 직접 가져옴
  const loadStudents = useStudentStore(state => state.loadStudents); // ← 필요시 사용

  const [submittedStudents, setSubmittedStudents] = useState<Set<number>>(new Set());

  const endpoint = useSessionInfoStore(state => state.endpoint);
  const subject = useSessionInfoStore(state => state.subject);
  const examId = useSessionInfoStore(state => state.examId);

  // ✅ 학생 목록이 없다면 한번만 로딩
  useEffect(() => {
    if (students.length === 0) {
      loadStudents(); // send('get-students') 호출됨
    }
  }, [students.length, loadStudents]);

  // ✅ SSE 연결 생명주기 관리
  useEffect(() => {
    if (!endpoint || !subject || !examId) {
      console.warn('[ExamSession] SSE 연결 정보 부족');
      return;
    }

    invoke('sse-start', { endpoint, subject, examId });
    console.log('[ExamSession] SSE 시작 요청 전송');

    const handleFileSaved = (data: { number: number }) => {
      console.log('[ExamSession] 제출 수신:', data);
      setSubmittedStudents(prev => new Set(prev).add(data.number));
    };

    receive('file-saved', handleFileSaved);

    return () => {
      send('sse-stop', null);
      console.log('[ExamSession] SSE 종료 요청 전송');
      removeListener('file-saved', handleFileSaved);
    };
  }, [endpoint, subject, examId, send, receive, removeListener]);

  return {
    studentList: students,
    submittedStudents,
  };
}
