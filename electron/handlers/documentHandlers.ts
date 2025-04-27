import { ipcMain } from 'electron';

export function registerDocumentHandlers() {
  ipcMain.handle('process-document', async (event, payload) => {
    try {
      const buffer = Buffer.from(payload.buffer);

      // @ts-ignore
      const { parseHwpBuffer } = (await import('../utils/hwpParser.cjs')) as {
        parseHwpBuffer: (buffer: Buffer) => Promise<string>;
      };

      const text = await parseHwpBuffer(buffer);

      return { success: true, text };
    } catch (err) {
      console.error('❌ HWP 파싱 오류:', err);
      return { success: false, message: '문서를 처리할 수 없습니다.' };
    }
  });
}
