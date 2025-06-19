import { ipcMain, dialog } from 'electron';

export function registerDialogHandlers() {
  // 에러 메시지 표시
  ipcMain.handle('show-error-dialog', async (event, message: string) => {
    try {
      const result = await dialog.showMessageBox({
        type: 'error',
        title: '오류',
        message: message,
        buttons: ['확인']
      });
      return { success: true, buttonIndex: result.response };
    } catch (error) {
      console.error('Dialog error:', error);
      return { success: false, error };
    }
  });

  // 정보 메시지 표시
  ipcMain.handle('show-info-dialog', async (event, message: string) => {
    try {
      const result = await dialog.showMessageBox({
        type: 'info',
        title: '알림',
        message: message,
        buttons: ['확인']
      });
      return { success: true, buttonIndex: result.response };
    } catch (error) {
      console.error('Dialog error:', error);
      return { success: false, error };
    }
  });

  // 경고 메시지 표시
  ipcMain.handle('show-warning-dialog', async (event, message: string) => {
    try {
      const result = await dialog.showMessageBox({
        type: 'warning',
        title: '경고',
        message: message,
        buttons: ['확인']
      });
      return { success: true, buttonIndex: result.response };
    } catch (error) {
      console.error('Dialog error:', error);
      return { success: false, error };
    }
  });

  // 성공 메시지 표시
  ipcMain.handle('show-success-dialog', async (event, message: string) => {
    try {
      const result = await dialog.showMessageBox({
        type: 'info',
        title: '성공',
        message: message,
        buttons: ['확인']
      });
      return { success: true, buttonIndex: result.response };
    } catch (error) {
      console.error('Dialog error:', error);
      return { success: false, error };
    }
  });

  // 확인/취소 대화상자
  ipcMain.handle('show-confirm-dialog', async (event, message: string, title?: string) => {
    try {
      const result = await dialog.showMessageBox({
        type: 'question',
        title: title || '확인',
        message: message,
        buttons: ['확인', '취소'],
        defaultId: 0,
        cancelId: 1
      });
      return { success: true, buttonIndex: result.response, confirmed: result.response === 0 };
    } catch (error) {
      console.error('Dialog error:', error);
      return { success: false, error };
    }
  });
}