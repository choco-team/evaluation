import { ipcMain } from 'electron';
import { loadQuestions, deleteQuestionById, saveQuestionList, loadQuestionById, saveQuestions } from '../fileManager/questionFileManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
export function registerQuestionHandlers() {
    ipcMain.on('get-question-list', (event, payload) => {
        const { subject } = payload;
        console.log('Load subject:', subject);
        try {
            const list = loadQuestions(subject);
            event.sender.send('get-question-list-response', {
                success: true,
                data: list,
                message: '',
            });
        }
        catch (err) {
            event.sender.send('get-question-list-response', {
                success: false,
                message: '문항 목록을 불러오지 못했습니다.',
            });
        }
    });
    ipcMain.on('save-question', (event, payload) => {
        const subject = payload.subject;
        try {
            const list = loadQuestions(subject);
            let updated;
            if (payload.id) {
                // id가 있는 경우: 기존 id 삭제 후 삽입
                updated = [...list.filter(q => q.id != payload.id), payload];
            }
            else {
                // id가 없는 경우: 새로운 고유 id 생성
                const existingIds = list.map(q => Number(q.id)).filter(id => !isNaN(id));
                const nextId = existingIds.length > 0 ? (Math.max(...existingIds) + 1).toString() : '1';
                const questionToSave = { ...payload, id: nextId };
                updated = [...list, questionToSave];
            }
            saveQuestionList(subject, updated);
            event.sender.send('save-question-response', {
                success: true,
                message: '문항이 저장되었습니다.',
            });
        }
        catch (err) {
            console.error('save-question error:', err);
            event.sender.send('save-question-response', {
                success: false,
                message: '문항 저장 중 오류 발생',
            });
        }
    });
    ipcMain.on('delete-question', (event, payload) => {
        const { id, subject } = payload;
        try {
            const updated = deleteQuestionById(subject, id);
            event.sender.send('delete-question-response', {
                success: true,
                message: '삭제 성공',
                data: updated
            });
        }
        catch (err) {
            event.sender.send('delete-question-response', {
                success: false,
                message: '삭제 중 오류 발생'
            });
        }
    });
    ipcMain.on('get-question-edit', (event, payload) => {
        const { id, subject } = payload;
        try {
            const question = loadQuestionById(subject, id);
            if (question) {
                event.sender.send('get-question-edit-response', {
                    success: true,
                    data: question,
                    message: '',
                });
            }
            else {
                event.sender.send('get-question-edit-response', {
                    success: false,
                    message: '문항을 찾을 수 없습니다.',
                });
            }
        }
        catch (err) {
            event.sender.send('get-question-edit-response', {
                success: false,
                message: '문항을 불러오는 중 오류 발생',
            });
        }
    });
    // 문제 저장하기
    ipcMain.on('save-question', (event, payload) => {
        try {
            const { subject_name } = payload;
            saveQuestions(subject_name, payload);
            event.sender.send('save-question-response', { success: true, message: '문제 저장 완료' });
        }
        catch (err) {
            console.error('❌ 문제 저장 오류:', err);
            event.sender.send('save-question-response', { success: false, message: '문제 저장 실패' });
        }
    });
    ipcMain.handle('get-exam', async (event, { id, subject }) => {
        const examData = loadQuestionById(subject, id);
        const students = loadStudents();
        if (!examData || !students)
            return event.sender.send('get-exam-response', { success: false, message: '문항 및 학생 파일 로드 중 오류 발생' });
        return {
            questionDetail: examData,
            studentList: students,
        };
    });
}
