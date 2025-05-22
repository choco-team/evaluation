// handlers/answer-handler.ts
import { ipcMain } from 'electron';
import { saveAnswerData } from '../fileManager/answerDataFileManager.js'; // ✨
export function registerAnswerDataHandler() {
    ipcMain.on('answer-data', (event, rawData) => {
        console.log('[AnswerHandler] answer-data 수신됨:', rawData);
        try {
            const parsed = JSON.parse(rawData.data);
            const { number, subject, Id, data } = parsed;
            if (!number || !subject || !Id || !data) {
                throw new Error('잘못된 데이터입니다');
            }
            saveAnswerData(subject, number, Id, data); // ✨ 파일 매니저 호출
        }
        catch (error) {
            console.error('[AnswerHandler] answer-data 파싱/저장 실패:', error);
        }
    });
}
