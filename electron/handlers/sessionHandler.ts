import { ipcMain } from 'electron';
import fetch from 'node-fetch';

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
}
