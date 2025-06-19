import { ipcMain, dialog } from 'electron';
import fetch from 'node-fetch';
import { getMainWindow } from '../windowManager.js';

export function registerSessionHandler() {
  ipcMain.handle('register-session', async (_, { apiBaseUrl, examData }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/evaluation/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: examData.questionDetail.title,
          answerSheet: examData.questionDetail.answerSheet,
          studentList: examData.studentList,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류: ${response.status} ${errorText}`);
      }

      const { sessionKey } = await response.json();

      return {
        success: true,
        sessionKey,
      };
    } catch (err: any) {
      console.error('[register-session] 실패:', err);
      return {
        success: false,
        message: err.message || '세션 등록 중 오류 발생',
      };
    }
  });

  // 🔧 Dialog API 추가
  ipcMain.handle('show-message-box', async (_, options) => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        throw new Error('메인 윈도우를 찾을 수 없습니다');
      }
      
      const result = await dialog.showMessageBox(mainWindow, options);
      return result;
    } catch (err: any) {
      console.error('[show-message-box] 실패:', err);
      return {
        success: false,
        message: err.message || 'Dialog 표시 중 오류 발생',
      };
    }
  });
}
