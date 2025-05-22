import { ipcMain } from 'electron';
import { startSSE, stopSSE } from '../sseManager/sseManager.js';

export function registerSSEHandlers() {
  ipcMain.handle('sse-start', async (_, info: { endpoint: string; subject: string; examId: string }) => {
    console.log('[IPC] SSE 시작 요청 수신:', info);
    startSSE(info); // info 객체 넘김
  });

  ipcMain.handle('sse-stop', async () => {
    console.log('[IPC] SSE 중지 요청 수신');
    stopSSE();
  });

  
}
