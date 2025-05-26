import { ipcMain } from 'electron';
import { loadQuestions } from '../fileManager/questionFileManager.js';
import { getStudentAnswerData } from '../fileManager/answerDataFileManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { createPromptText, openFolder } from '../fileManager/promptFileManager.js';
const maxLength = 150;
export async function registerpromptCreatingHandlers() {
    ipcMain.handle('get-subject-prompt', async (event, payload) => {
        console.log('프롬프트 생성 요청');
        try {
            const { subject } = payload;
            if (!subject)
                throw new Error(`요청에 오류가 발생하였습니다`);
            const question = loadQuestions(subject);
            const students = loadStudents();
            const numberList = students.map(student => student.number);
            for (let i = 0; i < numberList.length; i++) {
                const number = numberList[i];
                if (!number)
                    continue;
                const studentAnswers = getStudentAnswerData(subject, number);
                if (!studentAnswers)
                    continue;
                let text = `
지금부터 너는 교과 평가문을 작성해야하는 학교 교사야
이 학생의 교과 학습 발달 상황을 작성해줘!
너가 할 일은 평가지와 학생의 답안을 보고 학생에 대해 평가글을 작성하는 것이야
예를 들어 수학 문제에서 3+5를 맞춘 학생이면 '받아올림이 없는 한자리수의 덧셈 계산을 정확히 수행함',
사회 문제에서 지방자치단체장에 관한 문제를 맞추면 '우리나라의 지방자치단체장의 역할을 정확히 말함.' 등을 적어서 학생에 대한 교과학습 발달상황을 작성하는 것이야
각 문항별 답안은 배열로 제공될 것이고 배열 순서대로 문항에 대한 답을 적었다고 생각하면 돼
평가는 ${maxLength}자 내외로 작성해줘
배열로 주어진 학생의 답안을 기반으로 교과 학습 발달 상황을 작성할 것
제시된 문항에 관한 정보는 담지 말고 학생의 학습 발달 상황에만 초점을 두고 작성할 것
모든 문장은 "~함", "~임"으로 끝나도록 작성할 것
평가문과 관련 없는 내용은 일절 하지 말 것`;
                for (let q = 0; q < question.length; q++) {
                    const id = question[q].id;
                    const questionText = `
${q + 1}번째 평가지 : ${question[q].content}
평가 참고 사항 : ${question[q].comment}
평가 모범답안 : ${question[q].correctAnswer}
학생 작성 답안 : ${studentAnswers[Number(id)] ?? '답안 없음'}
`;
                    text = text + questionText;
                }
                console.log(text);
                createPromptText(subject, number, text);
            }
            return true;
        }
        catch (err) {
            console.error(err);
            return false;
        }
    });
}
ipcMain.handle('open-folder', async (event, folderPath) => {
    return await openFolder(folderPath);
});
