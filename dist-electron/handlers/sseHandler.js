import { ipcMain } from 'electron';
import { startSSE, stopSSE } from '../sseManager/sseManager.js';
export function registerSSEHandlers() {
    ipcMain.handle('sse-start', async (_, info) => {
        console.log('[IPC] SSE 시작 요청 수신 (원본):', info);
        const decodedSubject = decodeURIComponent(info.subject); // 👈 반드시 디코딩
        const cleanInfo = { ...info, subject: decodedSubject };
        console.log('[IPC] 디코딩된 subject:', decodedSubject);
        startSSE(cleanInfo); // 👈 디코딩된 값 전달
    });
    ipcMain.handle('sse-stop', async () => {
        console.log('[IPC] SSE 중지 요청 수신');
        stopSSE();
    });
}
