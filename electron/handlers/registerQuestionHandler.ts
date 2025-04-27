import { ipcMain } from 'electron';
import { loadSubjects } from '../fileManager/subjectFileManager'; // 과목 목록 불러오는 함수
import { saveQuestions } from '../fileManager/questionFileManager'; // 문제 저장하는 함수

export function registerQuestionHandlers() {
  // 과목 목록 가져오기
  ipcMain.on('get-subjects', (event) => {
    try {
      const subjects = loadSubjects(); // 과목 배열 반환
      event.sender.send('get-subjects-response', { success: true, data: subjects });
    } catch (err) {
      event.sender.send('get-subjects-response', { success: false, message: '과목 목록 로드 실패' });
    }
  });

  // 문제 저장하기
  ipcMain.on('save-question', (event, payload) => {
    try {
      const { subject_name } = payload
      saveQuestions(subject_name, payload); 
      event.sender.send('save-question-response', { success: true, message: '문제 저장 완료' });
    } catch (err) {
      console.error('❌ 문제 저장 오류:', err);
      event.sender.send('save-question-response', { success: false, message: '문제 저장 실패' });
    }
  });
}
