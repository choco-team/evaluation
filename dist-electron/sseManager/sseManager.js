// electron/sse/sseManager.ts
import http from 'http';
import { saveAnswerData } from '../fileManager/answerDataFileManager.js';
import { getMainWindow } from '../windowManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { hasStudentAnswer } from '../fileManager/answerDataFileManager.js';
import dotenv from 'dotenv';
dotenv.config();
let sseRequest = null;
export function startSSE(info) {
    const { endpoint, subject: encodedSubject, examId } = info;
    const subject = encodedSubject;
    console.log('[SSE] Decoded subject:', subject); // ✅ 여기서 잘 나와야 함
    console.log('[SSE] Trying to connect:', endpoint);
    const req = http.request(endpoint, {
        headers: { Accept: 'text/event-stream' },
    });
    req.on('response', res => {
        console.log('[SSE] Server Response Received');
        res.on('data', chunk => {
            const raw = chunk.toString();
            const match = raw.match(/^data:\s*(.*)$/m);
            if (!match)
                return;
            try {
                const payload = match[1];
                if (!payload.trim().startsWith('{'))
                    return;
                const parsed = JSON.parse(payload);
                const number = parsed.number;
                const sessionKey = parsed.sessionKey;
                const win = getMainWindow();
                requestMissingAnswerFromServer(win, subject, sessionKey, number, examId);
            }
            catch (err) {
                console.error('[SSE] JSON parse Error:', err);
            }
        });
        // ✅ 연결이 끊어졌을 때 자동 재시도
        res.on('end', () => {
            console.warn('[SSE] Connection ended. Retrying in 3 seconds...');
            setTimeout(() => startSSE(info), 3000);
        });
        res.on('close', () => {
            console.warn('[SSE] Connection closed. Retrying in 3 seconds...');
            setTimeout(() => startSSE(info), 3000);
        });
    });
    req.on('error', err => {
        console.error('[SSE] Connection error:', err);
        getMainWindow().webContents.send('sse-error', err.message);
        // ❗ 네트워크 단절 등의 경우에도 재시도
        setTimeout(() => startSSE(info), 3000);
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
export function notifyRenderer(win, studentNumber, examId, status) {
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
export function checkStudentsAllData(subject, examId) {
    const studentNumberList = loadStudents().map(student => student.number);
    const noAnswerList = [];
    for (const number of studentNumberList) {
        if (number && !hasStudentAnswer(subject, number, examId))
            noAnswerList.push(number);
    }
    return noAnswerList;
}
async function requestMissingAnswerFromServer(win, // BrowserWindow 인스턴스를 넘겨받음
subject, sessionKey, studentNumber, examId) {
    if (hasStudentAnswer(subject, studentNumber, examId)) {
        console.log(`[SSE] Answer sheet already downloaded: ${studentNumber} (${examId})`);
        return;
    }
    try {
        const baseUrl = process.env.API_BASE_URL;
        console.log('[DEBUG] API_BASE_URL:', baseUrl);
        if (!baseUrl) {
            console.error('[SSE] API_BASE_URL is undefined. Check .env or runtime config.');
            return;
        }
        const response = await fetch(`${baseUrl}/evaluation/${sessionKey}/${studentNumber}`);
        if (!response.ok) {
            const errorJson = await response.json(); // 여기서 깨진 메시지가 아님
            throw new Error(errorJson.message ?? '알 수 없는 오류');
        }
        const answerData = await response.json();
        console.log('[saveAnswerData] subject:', subject);
        saveAnswerData(subject, studentNumber, examId, answerData);
        notifyRenderer(win, studentNumber, examId, 'missing'); // 저장 성공 후 알림
        console.log(`[SSE] Answer sheet received right: ${studentNumber} (${examId})`);
    }
    catch (error) {
        console.error(`[SSE] Answer sheet request fail: ${studentNumber} (${examId})`, error);
    }
}
