import fs from 'fs';
import path from 'path';
import { PATHS } from '../pathManager.js'; // 📢 너가 작성한 PATHS import

/**
 * 답안 저장 함수
 * @param subject 과목명
 * @param number 학생번호
 * @param examId 평가지 ID
 * @param answerData 답안 데이터
 */
export function saveAnswerData(subject: string, number: number, examId: string, answerData: any) {
  const subjectDir = path.join(PATHS.answer, subject); // 과목별 디렉토리
  const studentFile = path.join(subjectDir, `student-${number}.json`); // 학생별 파일

  // 1. 과목 디렉토리가 없다면 생성
  if (!fs.existsSync(subjectDir)) {
    fs.mkdirSync(subjectDir, { recursive: true });
  }

  let studentAnswers: Record<string, any> = {};

  // 2. 학생 파일이 이미 있으면 기존 데이터 읽기
  if (fs.existsSync(studentFile)) {
    try {
      const existing = fs.readFileSync(studentFile, 'utf-8');
      studentAnswers = JSON.parse(existing);
    } catch (error) {
      console.error('[AnswerFileManager] 기존 파일 읽기 실패, 새로 생성합니다:', error);
      studentAnswers = {};
    }
  }

  // 3. 답안 추가 또는 덮어쓰기
  studentAnswers[examId] = answerData;

  // 4. 저장
  fs.writeFileSync(studentFile, JSON.stringify(studentAnswers, null, 2));
  console.log(`[AnswerFileManager] 답안 저장 완료: ${studentFile}`);
}


/**
 * 특정 과목의 특정 학생이 특정 평가지의 답안을 가지고 있는지 확인
 */
export function hasStudentAnswer(subject: string, number: number, examId: string | number): boolean {
  const subjectDir = path.join(PATHS.answer, subject);
  const studentFile = path.join(subjectDir, `student-${number}.json`);

  if (!fs.existsSync(studentFile)) {
    console.log('[AnswerCheck] 파일 없음:', studentFile);
    return false;
  }

  try {
    const content = fs.readFileSync(studentFile, 'utf-8');
    const parsed = JSON.parse(content);
    const keys = Object.keys(parsed);
    console.log(`[AnswerCheck] ${studentFile} → keys:`, keys, '| 찾는 examId:', String(examId));

    return String(examId) in parsed;
  } catch (err) {
    console.error('[AnswerCheck] 파일 파싱 오류:', err);
    return false;
  }
}


export function getStudentAnswerData(subject:string, student: number){
  const subjectDir = path.join(PATHS.answer, subject); // 과목별 디렉토리
  const studentFile = path.join(subjectDir, `student-${student}.json`); // 학생별 파일

    if (!fs.existsSync(subjectDir)) return null
    if (!fs.existsSync(studentFile)) return null

    const content = fs.readFileSync(studentFile, 'utf-8');
    const parsed = JSON.parse(content)
    if (!parsed) return null
    return parsed
}