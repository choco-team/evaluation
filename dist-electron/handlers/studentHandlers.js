import { ipcMain } from 'electron';
import { loadStudents, saveStudents } from '../fileManager/studentFileManager.js';
export function registerStudentHandlers() {
    // 학생 목록 불러오기
    ipcMain.on('get-students', (event) => {
        try {
            const students = loadStudents(); // ← 내부에서 자동 생성됨
            event.sender.send('get-students-response', {
                success: true,
                data: students,
                message: '',
            });
        }
        catch (err) {
            event.sender.send('get-students-response', {
                success: false,
                message: '학생 명단을 불러오는 데 실패했습니다.',
            });
        }
    });
    // 학생 목록 저장
    ipcMain.on('save-students', (event, payload) => {
        try {
            const { students } = payload;
            if (!Array.isArray(students))
                throw new Error('Invalid students format');
            const result = saveStudents(students);
            if (result) {
                event.sender.send('save-students-response', {
                    success: true,
                    message: '학생 명단이 저장되었습니다.',
                });
            }
            else {
                event.sender.send('save-students-response', {
                    success: false,
                    message: '학생 명단의 번호에 중복이 존재합니다.',
                });
            }
        }
        catch (err) {
            event.sender.send('save-students-response', {
                success: false,
                message: '학생 명단 저장 중 오류가 발생했습니다.',
            });
        }
    });
}
