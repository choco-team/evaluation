// electron/sse/sseManager.ts

import { saveAnswerData, hasStudentAnswer } from '../fileManager/answerDataFileManager.js';
import { getMainWindow } from '../windowManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { BrowserWindow } from 'electron';
import { EventSource } from 'eventsource';
import { serverURL } from '../baseUrl.js';

let sseConnection: EventSource | null = null;
let currentEndpoint: string | null = null;

export function startSSE(info: { endpoint: string; subject: string; examId: string }) {
  if (sseConnection && currentEndpoint === info.endpoint ) {
    console.log('[SSE] Already connected. Skipping reconnection.');
    return;
  }

  if (sseConnection) {
  console.log('[SSE] Existing SSE will be closed for new connection.');
  sseConnection.close();
  sseConnection = null;
}

  const win = getMainWindow();
  const { endpoint, subject, examId } = info;

  notifyAlreadySubmitted(win, subject, examId);

  console.log('[SSE] Decoded subject:', subject);
  console.log('[SSE] Trying to connect:', endpoint);

  sseConnection = createSSEConnection({ endpoint, subject, examId, win });
  currentEndpoint = info.endpoint
}

export function stopSSE() {
  if (sseConnection) {
    sseConnection.close();
    sseConnection = null;
    currentEndpoint = null;
    console.log('[SSE] Connection manually closed');
  }
}

function notifyAlreadySubmitted(win: BrowserWindow, subject: string, examId: string) {
  const submitted = checkStudentsAllData(subject, examId);
  submitted.forEach(number => {
    notifyRenderer(win, number, examId, 'missing');
    console.log(`[INIT] 기존 제출자 알림 전송됨: ${number}`);
  });
}

function createSSEConnection(info: {
  endpoint: string;
  subject: string;
  examId: string;
  win: BrowserWindow;
}): EventSource {
  const { endpoint, subject, examId, win } = info;
  const es = new EventSource(endpoint);

  es.onopen = () => console.log('[SSE] Connection opened');

  es.onmessage = event => handleSSEMessage(event, win, subject, examId);

  es.onerror = err => handleSSEError(err, info);

  return es;
}

function handleSSEMessage(
  event: MessageEvent,
  win: BrowserWindow,
  subject: string,
  examId: string
) {
  try {
    const payload = event.data;
    if (!payload.trim().startsWith('{')) return;

    const { number, sessionKey } = JSON.parse(payload);
    requestMissingAnswerFromServer(win, subject, sessionKey, number, examId);
  } catch (err) {
    console.error('[SSE] JSON parse error:', err);
  }
}

function handleSSEError(err: any, info: {
  endpoint: string;
  subject: string;
  examId: string;
  win: BrowserWindow;
}) {
  console.error('[SSE] Connection error:', err);
  info.win.webContents.send('sse-error', err.message ?? 'unknown error');

  if (sseConnection?.readyState === EventSource.CLOSED) {
    console.warn('[SSE] Stream closed. Retrying in 3 seconds...');
    sseConnection = null;
    setTimeout(() => startSSE(info), 3000);
  }
}

function checkStudentsAllData(subject: string, examId: string): number[] {
  const studentNumberList = loadStudents().map(student => student.number);
return studentNumberList
  .filter((n): n is number => n !== null)
  .filter(number => hasStudentAnswer(subject, number, examId));
}

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

async function requestMissingAnswerFromServer(
  win: BrowserWindow,
  subject: string,
  sessionKey: string,
  studentNumber: number,
  examId: string
) {
  if (hasStudentAnswer(subject, studentNumber, examId)) {
    console.log(`[SSE] Already downloaded: ${studentNumber} (${examId})`);
    return;
  }

  try {
    if (!serverURL) {
      console.error('[SSE] serverURL undefined. Check config.');
      return;
    }

    const response = await fetch(`${serverURL}/evaluation/${sessionKey}/${studentNumber}`);
    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message ?? 'Unknown error');
    }

    const answerData = await response.json();
    saveAnswerData(subject, studentNumber, examId, answerData);
    notifyRenderer(win, studentNumber, examId, 'missing');

    console.log(`[SSE] Answer sheet received: ${studentNumber} (${examId})`);
  } catch (error) {
    console.error(`[SSE] Answer fetch failed: ${studentNumber} (${examId})`, error);
  }
}
