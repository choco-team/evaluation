import fs from 'fs';
import path from 'path';
import { PATHS } from '../pathManager.js';
import { loadSubjects } from './subjectFileManager.js';
const QUESTION_DIR = PATHS.exam;
export function ensureQuestionDir() {
    if (!fs.existsSync(QUESTION_DIR)) {
        fs.mkdirSync(QUESTION_DIR, { recursive: true });
    }
}
export function getQuestionFilePath(subject) {
    return path.join(QUESTION_DIR, `${subject}.json`);
}
export function loadQuestions(subject) {
    ensureQuestionDir();
    if (subject) {
        // ✅ 특정 과목만 로드
        const filePath = getQuestionFilePath(subject);
        if (!fs.existsSync(filePath))
            return [];
        const raw = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(raw);
        // evaluationType 기본값 보장
        return questions.map((question) => ({
            ...question,
            evaluationType: question.evaluationType || 'answer'
        }));
    }
    else {
        // ✅ 모든 과목을 로드
        const allSubjects = loadSubjects(); // 예를 들어 ['국어', '수학', '과학']
        let allQuestions = [];
        for (const subj of allSubjects) {
            const filePath = getQuestionFilePath(subj);
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf-8');
                try {
                    const questions = JSON.parse(raw);
                    // evaluationType 기본값 보장
                    const questionsWithType = questions.map((question) => ({
                        ...question,
                        evaluationType: question.evaluationType || 'answer'
                    }));
                    allQuestions = allQuestions.concat(questionsWithType);
                }
                catch (err) {
                    console.error(`⚠️ 파일 파싱 실패: ${subj}.json`, err);
                }
            }
        }
        return allQuestions;
    }
}
export function saveQuestions(subject, newQuestion) {
    ensureQuestionDir();
    const filePath = getQuestionFilePath(subject);
    let questions = [];
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        questions = JSON.parse(raw);
    }
    const nextId = (questions.length + 1).toString();
    const questionWithId = {
        ...newQuestion,
        id: nextId,
        evaluationType: newQuestion.evaluationType || 'answer', // 기본값 설정
    };
    questions.push(questionWithId);
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
}
export function deleteQuestionById(subject, id) {
    const list = loadQuestions(subject);
    const updated = list.filter(q => q.id != id);
    saveQuestionList(subject, updated);
    return updated;
}
export function saveQuestionList(subject, questions) {
    ensureQuestionDir();
    const filePath = getQuestionFilePath(subject);
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
}
export function loadQuestionById(subject, id) {
    const list = loadQuestions(subject);
    const question = list.find(q => q.id == id); // 문자열 비교는 == 써도 무방
    if (question) {
        // evaluationType이 없는 기존 데이터에 대한 기본값 보장
        return {
            ...question,
            evaluationType: question.evaluationType || 'answer'
        };
    }
    return null;
}
