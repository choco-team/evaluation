// electron/sse/sseManager.ts
import { saveAnswerData } from '../fileManager/answerDataFileManager.js';
import { getMainWindow } from '../windowManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { hasStudentAnswer } from '../fileManager/answerDataFileManager.js';
import { EventSource } from 'eventsource';
let sseConnection = null;
/**
 * 답안이 없는 학생 번호 목록을 반환
 * @param subject 과목명
 */
function checkStudentsAllData(subject, examId) {
    const studentNumberList = loadStudents().map(student => student.number);
    const AnswerList = [];
    for (const number of studentNumberList) {
        if (number && hasStudentAnswer(subject, number, examId))
            AnswerList.push(number);
    }
    return AnswerList;
}
export function startSSE(info) {
    if (sseConnection) {
        console.log('[SSE] Already connected. Skipping reconnection.');
        return;
    }
    const win = getMainWindow();
    const { endpoint, subject, examId } = info;
    // SSE 연결 사전에 제출자 체크
    const alreadySubmitted = checkStudentsAllData(subject, examId);
    alreadySubmitted.forEach(number => {
        notifyRenderer(win, number, examId, 'missing');
        console.log(`[INIT] 기존 제출자 알림 전송됨: ${number}`);
    });
    console.log('[SSE] Decoded subject:', subject);
    console.log('[SSE] Trying to connect:', endpoint);
    const es = new EventSource(endpoint);
    es.onopen = () => {
        console.log('[SSE] Connection opened');
    };
    es.onmessage = event => {
        try {
            const payload = event.data;
            if (!payload.trim().startsWith('{'))
                return;
            const parsed = JSON.parse(payload);
            const number = parsed.number;
            const sessionKey = parsed.sessionKey;
            const win = getMainWindow();
            requestMissingAnswerFromServer(win, subject, sessionKey, number, examId);
        }
        catch (err) {
            console.error('[SSE] JSON parse error:', err);
        }
    };
    es.onerror = err => {
        console.error('[SSE] Connection error:', err);
        getMainWindow().webContents.send('sse-error', err.message ?? 'unknown error');
        // 재연결 실패로 끊어진 경우에는 수동 재시도
        if (es.readyState === EventSource.CLOSED) {
            console.warn('[SSE] Stream closed. Retrying in 3 seconds...');
            sseConnection = null;
            setTimeout(() => startSSE(info), 3000);
        }
    };
    sseConnection = es;
}
export function stopSSE() {
    if (sseConnection) {
        sseConnection.close();
        sseConnection = null;
        console.log('[SSE] Connection manually closed');
    }
}
/**
 * 렌더러 프로세스에 답안 상태 알림 전송
 */
export function notifyRenderer(win, studentNumber, examId, status) {
    win.webContents.send('answer-check', {
        studentNumber,
        examId,
        status,
        timestamp: new Date().toISOString(),
    });
}
async function requestMissingAnswerFromServer(win, // BrowserWindow 인스턴스를 넘겨받음
subject, sessionKey, studentNumber, examId) {
    if (hasStudentAnswer(subject, studentNumber, examId)) {
        console.log(`[SSE] Answer sheet already downloaded: ${studentNumber} (${examId})`);
        return;
    }
    try {
        const baseUrl = process.env.VITE_API_BASE_URL;
        console.log('[DEBUG] API_BASE_URL:', baseUrl);
        if (!baseUrl) {
            console.error('[SSE] API_BASE_URL is undefined. Check .env or runtime config.');
            return;
        }
        const response = await fetch(`${baseUrl}/evaluation/${sessionKey}/${studentNumber}`);
        if (!response.ok) {
            const errorJson = await response.json(); // 여기서 깨진 메시지가 아님
            throw new Error(errorJson.message ?? 'unkown Error');
        }
        const answerData = await response.json();
        console.log('[saveAnswerData] subject:', subject);
        saveAnswerData(subject, studentNumber, examId, answerData);
        notifyRenderer(win, studentNumber, examId, 'missing');
        console.log(`[SSE] Answer sheet received right: ${studentNumber} (${examId})`);
    }
    catch (error) {
        console.error(`[SSE] Answer sheet request fail: ${studentNumber} (${examId})`, error);
    }
}
