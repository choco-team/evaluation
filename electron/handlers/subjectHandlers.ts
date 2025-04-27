import { ipcMain } from 'electron';
import { loadSubjects, saveSubjects } from '../fileManager/subjectFileManager.js';

export function registerSubjectHandlers() {
  ipcMain.on('get-subjects', (event) => {
    try {
      const subjects = loadSubjects();
      event.sender.send('get-subjects-response', {
        success: true,
        data: subjects,
      });
    } catch (err) {
      event.sender.send('get-subjects-response', {
        success: false,
        message: '과목 목록을 불러오지 못했습니다.',
      });
    }
  });

  ipcMain.on('add-subject', (event, payload) => {
    try {
      const subjects = loadSubjects();
      const name = payload.name;
      if (!name || typeof name !== 'string') throw new Error();

      if (subjects.includes(name)) {
        event.sender.send('add-subject-response', {
          success: false,
          message: `'${name}' 과목이 이미 존재합니다.`,
        });
        return;
      }

      const updated = [...subjects, name];
      saveSubjects(updated);

      event.sender.send('add-subject-response', {
        success: true,
        message: `'${name}' 과목이 추가되었습니다.`,
      });
    } catch (err) {
      event.sender.send('add-subject-response', {
        success: false,
        message: '과목 추가 중 오류가 발생했습니다.',
      });
    }
  });
  ipcMain.on('update-subject', (event, payload) => {
    try {
      const { selected, name } = payload;
      const subjects = loadSubjects();
  
      if (!selected || !name || typeof name !== 'string') throw new Error();
  
      // 같은 이름이면 아무 작업도 하지 않고 성공 처리
      if (selected === name) {
        event.sender.send('update-subject-response', {
          success: true,
          message: '변경 사항이 없습니다.',
        });
        return;
      }
  
      // 중복 이름 존재 시 에러 처리
      if (subjects.includes(name)) {
        event.sender.send('update-subject-response', {
          success: false,
          message: `'${name}' 과목이 이미 존재합니다.`,
        });
        return;
      }
  
      const updatedSubjects = subjects.map((subject) =>
        subject === selected ? name : subject
      );
  
      saveSubjects(updatedSubjects);
  
      event.sender.send('update-subject-response', {
        success: true,
        message: `'${selected}'을(를) '${name}'으로 변경했습니다.`,
      });
    } catch (err) {
      event.sender.send('update-subject-response', {
        success: false,
        message: '과목 이름 수정 중 오류가 발생했습니다.',
      });
    }
  });
  
  ipcMain.on('delete-subject', (event, payload) => {
    try {
      const { name } = payload;
      const subjects = loadSubjects();
  
      if (!name || typeof name !== 'string') throw new Error();
  
      const updatedSubjects = subjects.filter((subject) => subject !== name);
      saveSubjects(updatedSubjects);
  
      event.sender.send('delete-subject-response', {
        success: true,
        message: `'${name}' 과목이 삭제되었습니다.`,
      });
    } catch (err) {
      event.sender.send('delete-subject-response', {
        success: false,
        message: '과목 삭제 중 오류가 발생했습니다.',
      });
    }
  });
  



}
