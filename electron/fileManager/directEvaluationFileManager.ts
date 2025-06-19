import fs from 'fs';
import path from 'path';
import { PATHS } from '../pathManager.js';
import { DirectEvaluationResult } from '../types/question-types.js';

/**
 * 직접평가 데이터 저장 함수
 * @param subject 과목명
 * @param studentNumber 학생번호
 * @param evaluationData 직접평가 데이터
 */
export function saveDirectEvaluation(subject: string, studentNumber: number, evaluationData: DirectEvaluationResult) {
  const subjectDir = path.join(PATHS.directEvaluation, subject); // 과목별 디렉토리
  const studentFile = path.join(subjectDir, `student-${studentNumber}.json`); // 학생별 파일

  // 1. 과목 디렉토리가 없다면 생성
  if (!fs.existsSync(subjectDir)) {
    fs.mkdirSync(subjectDir, { recursive: true });
  }

  let studentEvaluations: Record<string, DirectEvaluationResult> = {};

  // 2. 학생 파일이 이미 있으면 기존 데이터 읽기
  if (fs.existsSync(studentFile)) {
    try {
      const existing = fs.readFileSync(studentFile, 'utf-8');
      studentEvaluations = JSON.parse(existing);
    } catch (error) {
      console.error('[DirectEvaluationFileManager] 기존 파일 읽기 실패, 새로 생성합니다:', error);
      studentEvaluations = {};
    }
  }

  // 3. 평가 데이터 추가 또는 덮어쓰기 (updatedAt 추가)
  const saveData = {
    ...evaluationData,
    updatedAt: new Date().toISOString()
  };
  
  studentEvaluations[evaluationData.evaluationId] = saveData;

  // 4. 저장
  fs.writeFileSync(studentFile, JSON.stringify(studentEvaluations, null, 2));
  console.log(`[DirectEvaluationFileManager] 직접평가 저장 완료: ${studentFile}`);
}

/**
 * 여러 직접평가 데이터 일괄 저장 함수
 * @param evaluationDataList 직접평가 데이터 배열
 */
export function saveDirectEvaluations(evaluationDataList: DirectEvaluationResult[]) {
  // 과목과 학생번호별로 그룹핑
  const groupedData: Record<string, Record<string, DirectEvaluationResult[]>> = {};
  
  evaluationDataList.forEach(data => {
    const { evaluationId, studentNumber } = data;
    // evaluationId에서 과목 정보 추출 (예: "math_eval_1" → "math")
    const subject = extractSubjectFromEvaluationId(evaluationId);
    
    if (!groupedData[subject]) {
      groupedData[subject] = {};
    }
    if (!groupedData[subject][studentNumber]) {
      groupedData[subject][studentNumber] = [];
    }
    
    groupedData[subject][studentNumber].push(data);
  });

  // 각 과목/학생별로 저장
  Object.keys(groupedData).forEach(subject => {
    Object.keys(groupedData[subject]).forEach(studentNumberStr => {
      const studentNumber = parseInt(studentNumberStr);
      const evaluations = groupedData[subject][studentNumberStr];
      
      // 기존 데이터 로드
      const existingEvaluations = getStudentDirectEvaluations(subject, studentNumber);
      
      // 새 데이터로 업데이트
      evaluations.forEach(evaluation => {
        existingEvaluations[evaluation.evaluationId] = {
          ...evaluation,
          updatedAt: new Date().toISOString()
        };
      });
      
      // 저장
      const subjectDir = path.join(PATHS.directEvaluation, subject);
      const studentFile = path.join(subjectDir, `student-${studentNumber}.json`);
      
      if (!fs.existsSync(subjectDir)) {
        fs.mkdirSync(subjectDir, { recursive: true });
      }
      
      fs.writeFileSync(studentFile, JSON.stringify(existingEvaluations, null, 2));
    });
  });
  
  console.log(`[DirectEvaluationFileManager] 직접평가 일괄 저장 완료: ${evaluationDataList.length}건`);
}

/**
 * 특정 학생의 모든 직접평가 데이터 조회
 * @param subject 과목명
 * @param studentNumber 학생번호
 * @returns 직접평가 데이터 객체 (evaluationId를 키로 하는 객체)
 */
export function getStudentDirectEvaluations(subject: string, studentNumber: number): Record<string, DirectEvaluationResult> {
  const subjectDir = path.join(PATHS.directEvaluation, subject);
  const studentFile = path.join(subjectDir, `student-${studentNumber}.json`);

  if (!fs.existsSync(studentFile)) {
    console.log(`[DirectEvaluationFileManager] 파일 없음: ${studentFile}`);
    return {};
  }

  try {
    const content = fs.readFileSync(studentFile, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed || {};
  } catch (error) {
    console.error('[DirectEvaluationFileManager] 파일 파싱 오류:', error);
    return {};
  }
}

/**
 * 특정 평가항목의 직접평가 데이터 조회
 * @param subject 과목명
 * @param studentNumber 학생번호
 * @param evaluationId 평가항목 ID
 * @returns 직접평가 데이터 또는 null
 */
export function getDirectEvaluationById(subject: string, studentNumber: number, evaluationId: string): DirectEvaluationResult | null {
  const studentEvaluations = getStudentDirectEvaluations(subject, studentNumber);
  return studentEvaluations[evaluationId] || null;
}

/**
 * 특정 평가항목의 모든 학생 직접평가 데이터 조회 (과목 지정)
 * @param subject 과목명
 * @param evaluationId 평가항목 ID
 * @returns 직접평가 데이터 배열
 */
export function getEvaluationResultsBySubject(subject: string, evaluationId: string): DirectEvaluationResult[] {
  const subjectDir = path.join(PATHS.directEvaluation, subject);
  
  if (!fs.existsSync(subjectDir)) {
    console.log(`[DirectEvaluationFileManager] 과목 디렉토리 없음: ${subjectDir}`);
    return [];
  }

  const results: DirectEvaluationResult[] = [];
  
  try {
    const files = fs.readdirSync(subjectDir);
    
    files.forEach(file => {
      if (file.startsWith('student-') && file.endsWith('.json')) {
        const studentNumber = parseInt(file.replace('student-', '').replace('.json', ''));
        const evaluation = getDirectEvaluationById(subject, studentNumber, evaluationId);
        
        if (evaluation) {
          results.push(evaluation);
        }
      }
    });
  } catch (error) {
    console.error(`[DirectEvaluationFileManager] 과목 디렉토리 읽기 실패: ${subjectDir}`, error);
  }
  
  return results;
}

/**
 * 특정 평가항목의 모든 학생 직접평가 데이터 조회
 * @param evaluationId 평가항목 ID
 * @returns 직접평가 데이터 배열
 */
export function getEvaluationResults(evaluationId: string): DirectEvaluationResult[] {
  const subject = extractSubjectFromEvaluationId(evaluationId);
  return getEvaluationResultsBySubject(subject, evaluationId);
}

/**
 * 직접평가 데이터 삭제
 * @param subject 과목명
 * @param studentNumber 학생번호
 * @param evaluationId 평가항목 ID
 * @returns 삭제 성공 여부
 */
export function deleteDirectEvaluation(subject: string, studentNumber: number, evaluationId: string): boolean {
  try {
    const studentEvaluations = getStudentDirectEvaluations(subject, studentNumber);
    
    if (!(evaluationId in studentEvaluations)) {
      console.log(`[DirectEvaluationFileManager] 삭제할 평가 데이터 없음: ${evaluationId}`);
      return false;
    }
    
    delete studentEvaluations[evaluationId];
    
    const subjectDir = path.join(PATHS.directEvaluation, subject);
    const studentFile = path.join(subjectDir, `student-${studentNumber}.json`);
    
    // 빈 객체면 파일 삭제, 아니면 업데이트
    if (Object.keys(studentEvaluations).length === 0) {
      fs.unlinkSync(studentFile);
      console.log(`[DirectEvaluationFileManager] 빈 파일 삭제: ${studentFile}`);
    } else {
      fs.writeFileSync(studentFile, JSON.stringify(studentEvaluations, null, 2));
      console.log(`[DirectEvaluationFileManager] 평가 데이터 삭제 완료: ${evaluationId}`);
    }
    
    return true;
  } catch (error) {
    console.error('[DirectEvaluationFileManager] 삭제 실패:', error);
    return false;
  }
}

/**
 * 특정 과목의 모든 직접평가 데이터 조회 (통계용)
 * @param subject 과목명
 * @returns 전체 직접평가 데이터 배열
 */
export function getAllDirectEvaluations(subject: string): DirectEvaluationResult[] {
  const subjectDir = path.join(PATHS.directEvaluation, subject);
  
  if (!fs.existsSync(subjectDir)) {
    return [];
  }

  const allEvaluations: DirectEvaluationResult[] = [];
  const files = fs.readdirSync(subjectDir);
  
  files.forEach(file => {
    if (file.startsWith('student-') && file.endsWith('.json')) {
      const studentNumber = parseInt(file.replace('student-', '').replace('.json', ''));
      const studentEvaluations = getStudentDirectEvaluations(subject, studentNumber);
      
      Object.values(studentEvaluations).forEach(evaluation => {
        allEvaluations.push(evaluation);
      });
    }
  });
  
  return allEvaluations;
}

/**
 * evaluationId에서 과목명 추출
 * 모든 과목 디렉토리를 순회하여 해당 evaluationId를 가진 평가항목을 찾음
 */
function extractSubjectFromEvaluationId(evaluationId: string): string {
  try {
    // 직접평가 디렉토리가 없으면 'unknown' 반환
    if (!fs.existsSync(PATHS.directEvaluation)) {
      return 'unknown';
    }

    // 모든 과목 디렉토리 순회
    const subjectDirs = fs.readdirSync(PATHS.directEvaluation, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const subject of subjectDirs) {
      const subjectDir = path.join(PATHS.directEvaluation, subject);
      const files = fs.readdirSync(subjectDir);
      
      // 해당 과목의 모든 학생 파일 순회
      for (const file of files) {
        if (file.startsWith('student-') && file.endsWith('.json')) {
          const filePath = path.join(subjectDir, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const evaluations = JSON.parse(content);
            
            // 해당 evaluationId가 있는지 확인
            if (evaluations[evaluationId]) {
              return subject;
            }
          } catch (error) {
            console.error(`파일 읽기 실패: ${filePath}`, error);
          }
        }
      }
    }
    
    return 'unknown';
  } catch (error) {
    console.error('extractSubjectFromEvaluationId 오류:', error);
    return 'unknown';
  }
}

/**
 * 특정 평가항목에 대한 학생별 완료 현황 확인
 * @param evaluationId 평가항목 ID
 * @returns 학생번호별 완료 여부 맵
 */
export function getEvaluationCompletionStatus(evaluationId: string): Record<number, boolean> {
  const results = getEvaluationResults(evaluationId);
  const completionMap: Record<number, boolean> = {};
  
  results.forEach(result => {
    completionMap[result.studentNumber] = result.result.trim() !== '';
  });
  
  return completionMap;
}