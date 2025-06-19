import { ipcMain } from 'electron';
import { loadQuestions, loadQuestionById } from '../fileManager/questionFileManager.js'; // loadQuestionById 다시 추가
import { getStudentAnswerData } from '../fileManager/answerDataFileManager.js';
import { getStudentDirectEvaluations } from '../fileManager/directEvaluationFileManager.js';
import { loadStudents } from '../fileManager/studentFileManager.js';
import { createPromptText, openFolder, loadTemplate } from '../fileManager/promptFileManager.js';
export async function registerPromptCreatingHandlers() {
    ipcMain.handle('get-subject-prompt', async (event, payload) => {
        console.log('프롬프트 생성 요청');
        try {
            const { subject } = payload;
            if (!subject)
                throw new Error(`요청에 오류가 발생하였습니다`);
            // 답안평가 데이터 로드
            const questions = loadQuestions(subject);
            const students = loadStudents();
            const numberList = students.map(student => student.number);
            // 저장된 템플릿 로드
            const template = loadTemplate();
            const basePromptText = template.content;
            for (let i = 0; i < numberList.length; i++) {
                const number = numberList[i];
                if (!number)
                    continue;
                // 답안평가 데이터 가져오기
                const studentAnswers = getStudentAnswerData(subject, number);
                // 직접평가 데이터 가져오기
                const directEvaluations = getStudentDirectEvaluations(subject, number);
                // 답안평가와 직접평가 모두 없으면 스킵
                if (!studentAnswers && (!directEvaluations || Object.keys(directEvaluations).length === 0)) {
                    console.log(`${number}번 학생: 평가 데이터 없음`);
                    continue;
                }
                // 템플릿을 그대로 사용
                let text = basePromptText;
                // ===== 답안평가 섹션 =====
                if (studentAnswers && questions.length > 0) {
                    text += "\n\n=== 답안평가 결과 ===\n";
                    for (let q = 0; q < questions.length; q++) {
                        const id = questions[q].id;
                        const questionText = `
${q + 1}번째 평가지 : ${questions[q].content}
평가 참고 사항 : ${questions[q].comment}
평가 모범답안 : ${questions[q].correctAnswer}
학생 작성 답안 : ${studentAnswers[Number(id)] ?? '답안 없음'}
`;
                        text = text + questionText;
                    }
                }
                // ===== 직접평가 섹션 =====
                if (directEvaluations && Object.keys(directEvaluations).length > 0) {
                    text += "\n\n=== 직접평가 결과 ===\n";
                    let directEvalIndex = 1;
                    Object.values(directEvaluations).forEach(evaluation => {
                        // 평가항목 정보 조회 (교사가 직접 입력한 제목과 설명)
                        const evaluationItem = loadQuestionById(subject, evaluation.evaluationId);
                        const evaluationTitle = evaluationItem?.title || '직접평가';
                        const evaluationDescription = evaluationItem?.comment || '';
                        const directEvalText = `
${directEvalIndex}번째 직접평가: ${evaluationTitle}
${evaluationDescription ? `평가 설명: ${evaluationDescription}` : ''}
평가 내용: ${evaluation.result}
${evaluation.score !== undefined ? `점수: ${evaluation.score}점` : '점수: 미입력'}
`;
                        text += directEvalText;
                        directEvalIndex++;
                    });
                }
                // 평가 데이터가 있는 경우에만 프롬프트 생성
                if (studentAnswers || Object.keys(directEvaluations || {}).length > 0) {
                    console.log(`${number}번 학생 프롬프트 생성 완료`);
                    createPromptText(subject, number, text);
                }
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
