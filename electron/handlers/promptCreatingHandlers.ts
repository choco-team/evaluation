import { ipcMain } from 'electron';
import { loadQuestions } from '../fileManager/questionFileManager.js';
import { getStudentAnswerData } from '../fileManager/answerDataFileManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { StudentAnswers } from '../types/question-types.js';
import { 
  createPromptText, 
  openFolder, 
  loadTemplate
} from '../fileManager/promptFileManager.js';

export async function registerPromptCreatingHandlers() {
  ipcMain.handle('get-subject-prompt', async (event, payload) => {
    console.log('프롬프트 생성 요청')
    try {
        const { subject } = payload
        if (!subject) throw new Error(`요청에 오류가 발생하였습니다`)
        const question = loadQuestions(subject)

        const students = loadStudents()
        const numberList = students.map(student => student.number)
        
        // 저장된 템플릿 로드
        const template = loadTemplate();
        const basePromptText = template.content;
        
        for (let i=0; i<numberList.length; i++){
        const number = numberList[i]
        if (!number) continue
        const studentAnswers:StudentAnswers = getStudentAnswerData(subject, number)
        if (!studentAnswers) continue;
        
        // 템플릿을 그대로 사용
        let text = basePromptText
        for (let q=0; q<question.length;q++){
          const id = question[q].id
          const questionText = `
${q+1}번째 평가지 : ${question[q].content}
평가 참고 사항 : ${question[q].comment}
평가 모범답안 : ${question[q].correctAnswer}
학생 작성 답안 : ${studentAnswers[Number(id)] ?? '답안 없음'}
`
text = text + questionText
        }
        console.log(text)
        createPromptText(subject, number, text)        
}        
        return true        
    } catch (err) {
      console.error(err)
        return false
    }
  });
}


ipcMain.handle('open-folder', async (event, folderPath) => {
  return await openFolder(folderPath)
});