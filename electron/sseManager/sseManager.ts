// electron/sse/sseManager.ts
import http from 'http';
import type { ClientRequest } from 'http';
import { saveAnswerData } from '../fileManager/answerDataFileManager.js';
import { getMainWindow } from '../windowManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { hasStudentAnswer } from '../fileManager/answerDataFileManager.js';
import dotenv from 'dotenv';
import { BrowserWindow } from 'electron';
dotenv.config();

let sseRequest: ClientRequest | null = null;

    export function startSSE(info: { endpoint: string; subject: string; examId: string }) {
  const { endpoint, subject: encodedSubject, examId } = info;
  
    const subject = decodeURIComponent(encodedSubject); // ✅ 여기서 복원
        console.log(info)
      
        const req = http.request(endpoint, {
          headers: { Accept: 'text/event-stream' },
        });
      
        req.on('response', res => {
          console.log('[SSE] Server Response Received');
res.on('data', chunk => {
  const raw = chunk.toString();
  console.log('[SSE] Raw chunk:', raw); // 여기까지 나오면 연결은 OK

  const match = raw.match(/^data:\s*(.*)$/m);
  if (!match) {
    console.warn('[SSE] Data Type Error:', raw);
    return;
  }

  try {
    const payload = match[1];
    console.log('[SSE] Parsed payload string:', payload);

    if (!payload.trim().startsWith('{')) {
      console.warn('[SSE] Response is not JSON:', payload);
      return;
    }

    const parsed = JSON.parse(payload);
    console.log('[SSE] Parsed JSON:', parsed);

    const number = parsed.number;
    const sessionKey = parsed.sessionKey;
    const win = getMainWindow();

    requestMissingAnswerFromServer(win, subject, sessionKey, number, examId);
  } catch (err) {
    console.error('[SSE] JSON parse Error:', err);
  }
});
                                  });
      
        req.on('error', err => {
          console.error('[SSE] connect Error:', err);
          getMainWindow().webContents.send('sse-error', err.message);
        });
      
        req.end();
        sseRequest = req;
      }
      
export function stopSSE() {
  if (sseRequest) {
    sseRequest.destroy();
    sseRequest = null;
  }
}


/**
 * 렌더러 프로세스에 답안 상태 알림 전송
 */
export function notifyRenderer(
  win: BrowserWindow,
  studentNumber: number,
  examId: string,
  status: 'found' | 'missing'
) {
  win.webContents.send('answer-check', {
    studentNumber,
    examId,
    status,
    timestamp: new Date().toISOString(),
  });
}


/**
 * 답안이 없는 학생 번호 목록을 반환
 * @param subject 과목명
 */
export function checkStudentsAllData(subject: string, examId:string): number[] {
  const studentNumberList = loadStudents().map(student => student.number);

  const noAnswerList: number[] = [];

  for (const number of studentNumberList) {
   if (number && !hasStudentAnswer(subject, number as number, examId)) noAnswerList.push(number)
  }

  return noAnswerList;
}    

async function requestMissingAnswerFromServer(
  win: BrowserWindow,  // BrowserWindow 인스턴스를 넘겨받음
  subject: string,
  sessionKey: string,
  studentNumber: number,
  examId: string
) {
  if (hasStudentAnswer(subject, studentNumber, examId)) {
    console.log(`[SSE] Answer sheet already downloaded: ${studentNumber} (${examId})`);
    return;
  }

  try {
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/${sessionKey}/${studentNumber}`);
    if (!response.ok) {
  const errorJson = await response.json(); // 여기서 깨진 메시지가 아님
  throw new Error(errorJson.message ?? '알 수 없는 오류');
    }

    const answerData = await response.json();
    saveAnswerData(subject, studentNumber, examId, answerData);
    notifyRenderer(win, studentNumber, examId, 'missing');  // 저장 성공 후 알림
    console.log(`[SSE] Answer sheet received right: ${studentNumber} (${examId})`);
  } catch (error) {
    console.error(`[SSE] Answer sheet request fail: ${studentNumber} (${examId})`, error);
  }
}