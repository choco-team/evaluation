import { StudentAnswerStatus, useStudentStore } from '../../common/store/studentsStore';
import { useSessionInfoStore, usePageStore } from '../../common/store/use-page-store';
import { useElectron } from '../../common/useElectron';
import { useExamSession } from './useExamSession';
import { useQrCode } from './useQrCode';
import { useEffect } from 'react';

export function QrCode() {
const { send, receive, removeListener } = useElectron(); // ✅ 딱 한 번만 호출

  const { studentList, submittedStudents } = useExamSession();
  const { generateQRCode, copyToClipboard } = useQrCode();

  const qrcodeLink = useSessionInfoStore(state => state.qrcodeLink);
  const subject = useSessionInfoStore(state => state.subject);
  const examId = useSessionInfoStore(state => state.examId);
  const endpoint = useSessionInfoStore(state => state.endpoint);
  const setCurrentPage = usePageStore(state => state.setCurrentPage);

  useEffect(() => {
  const listener = (_event: any, data: StudentAnswerStatus) => {
    useStudentStore.getState().addAnswerStatus(data);
  };

receive('answer-check', (data) => {
  if (data && typeof data.studentNumber === 'number') {
    useStudentStore.getState().addAnswerStatus(data);
  } else {
    console.warn('[IPC] 잘못된 answer-check 데이터 수신:', data);
  }
});

  return () => {
    removeListener('answer-check', listener);
  };
}, []);



  useEffect(() => {
    if (!endpoint || !subject || !examId) {
      console.warn('SSE 연결 정보 부족');
      return;
    }
  
    send('sse-start', { endpoint, subject:encodeURIComponent(subject), examId });
    console.log('SSE 연결 시작됨');
  }, [endpoint, subject, examId, send]); // ✅ 의존성 배열 추가
  
  // 🔹 QR 코드 생성
  useEffect(() => {
    if (qrcodeLink) {
      generateQRCode('qr', qrcodeLink);
    }
  }, [qrcodeLink, generateQRCode]);

  // 🔹 학생 목록 예시 (실제는 API나 props 등으로 설정 가능)

  const handleCopy = () => {
    copyToClipboard(qrcodeLink);
  };

  const handleGoBack = () => {
    send('sse-stop', null); // ✨ 여기서 명시적으로 종료
    setCurrentPage('prepare');
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center min-h-screen p-6">
      {/* 안내문 */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center max-w-md">
        <strong className="font-bold">주의!</strong>
        <span className="block sm:inline">
          이 페이지를 닫으면 연결이 끊겨 학생들이 시험 결과를 제출할 수 없습니다.
        </span>
      </div>

      <canvas id="qr" className="w-64 h-64 mb-6"></canvas>

      <button
        onClick={handleCopy}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded shadow-md transition-all mb-4"
      >
        URL 복사
      </button>

      <button
        onClick={handleGoBack}
        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded shadow-md transition-all"
      >
        돌아가기
      </button>

<div className="mt-8 w-full max-w-md">
  <h3 className="text-lg font-bold mb-2">✅ 제출 완료 학생</h3>
  <ul className="list-disc list-inside space-y-1 mb-6">
    {[...submittedStudents]
      .sort((a, b) => a - b)
      .map(number => {
        const student = studentList.find(s => s.number === number);
        return (
          <li key={`submitted-${number}`}>
            {student ? `${student.number}번 ${student.name}` : `번호 ${number}`}
          </li>
        );
      })}
  </ul>

  <h3 className="text-lg font-bold mb-2">⏳ 제출 미완료 학생</h3>
  <ul className="list-disc list-inside space-y-1 text-gray-500">
    {studentList
      .filter(student => typeof student.number === 'number')
      .filter(student => !submittedStudents.has(student.number!)) 
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
      .map(student => (
        <li key={`not-submitted-${student.number}`}>
          {student.number}번 {student.name}
        </li>
      ))}
  </ul>
</div>
    </div>
  );
}
