import { ipcMain } from 'electron';
import { 
  saveDirectEvaluation,
  saveDirectEvaluations,
  getStudentDirectEvaluations,
  getDirectEvaluationById,
  getEvaluationResults,
  getEvaluationResultsBySubject, // 새로 추가
  deleteDirectEvaluation,
  getAllDirectEvaluations,
  getEvaluationCompletionStatus
} from '../fileManager/directEvaluationFileManager.js';
import { DirectEvaluationResult } from '../types/question-types.js';

// 과목 추출 함수를 사용하기 위해 import를 추가해야 합니다.
// 하지만 extractSubjectFromEvaluationId는 private 함수이므로 직접 처리하겠습니다.

/**
 * evaluationId로부햄 과목명 추출 (레거시 지원용)
 */
function extractSubjectFromEvaluationId(evaluationId: string): string {
  // 기본적으로 unknown 반환 (이젠 명시적 subject 전달 사용)
  return 'unknown';
}

export async function registerDirectEvaluationHandlers() {
  
  /**
   * 직접평가 데이터 저장 (단일/다중)
   */
  ipcMain.handle('save-direct-evaluation', async (event, payload) => {
    try {
      console.log('[DirectEvaluationHandler] 직접평가 저장 요청:', payload);
      
      // 새로운 형식: { subject, evaluations }
      if (payload.subject && payload.evaluations && Array.isArray(payload.evaluations)) {
        // 다중 저장 - 과목 정보가 명시적으로 전달됨
        const { subject, evaluations } = payload;
        
        console.log(`[DirectEvaluationHandler] 과목 '${subject}'에 ${evaluations.length}건 저장 시도`);
        
        let totalSaved = 0;
        for (const evaluation of evaluations) {
          try {
            saveDirectEvaluation(subject, evaluation.studentNumber, evaluation);
            totalSaved++;
          } catch (error) {
            console.error(`[DirectEvaluationHandler] 학생 ${evaluation.studentNumber} 저장 실패:`, error);
          }
        }
        
        return {
          success: true,
          message: `${totalSaved}건의 직접평가를 저장했습니다.`
        };
      }
      // 기존 형식 지원 (Array 또는 단일 객체)
      else if (Array.isArray(payload)) {
        // 레거시 지원: 배열로 전달된 경우
        console.log('[DirectEvaluationHandler] 레거시 형식 저장 시도');
        saveDirectEvaluations(payload);
        return {
          success: true,
          message: `${payload.length}건의 직접평가를 저장했습니다.`
        };
      } else {
        // 단일 저장
        const { subject, studentNumber, ...evaluationData } = payload;
        saveDirectEvaluation(subject, studentNumber, evaluationData);
        return {
          success: true,
          message: '직접평가를 저장했습니다.'
        };
      }
    } catch (error) {
      console.error('[DirectEvaluationHandler] 저장 실패:', error);
      return {
        success: false,
        message: `직접평가 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      };
    }
  });

  /**
   * 특정 평가항목의 직접평가 데이터 로드
   */
  ipcMain.handle('load-direct-evaluation', async (event, payload) => {
    try {
      const { evaluationId, subject } = payload; // subject 추가
      console.log('[DirectEvaluationHandler] 직접평가 로드 요청:', evaluationId, 'subject:', subject);
      
      // subject가 제공되면 직접 사용, 아니면 추출 시도
      const targetSubject = subject || extractSubjectFromEvaluationId(evaluationId);
      
      if (targetSubject === 'unknown') {
        return {
          success: true,
          data: [], // 비어있는 데이터 반환
          message: '기존 평가 데이터가 없습니다.'
        };
      }
      
      const results = getEvaluationResultsBySubject(targetSubject, evaluationId);
      
      return {
        success: true,
        data: results,
        message: `${results.length}건의 직접평가 데이터를 로드했습니다.`
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 로드 실패:', error);
      return {
        success: false,
        data: [],
        message: '직접평가 데이터 로드에 실패했습니다.'
      };
    }
  });

  /**
   * 특정 학생의 모든 직접평가 데이터 조회
   */
  ipcMain.handle('get-student-direct-evaluations', async (event, payload) => {
    try {
      const { subject, studentNumber } = payload;
      console.log('[DirectEvaluationHandler] 학생 직접평가 조회:', { subject, studentNumber });
      
      const evaluations = getStudentDirectEvaluations(subject, studentNumber);
      
      return {
        success: true,
        data: evaluations,
        message: '학생 직접평가 데이터를 조회했습니다.'
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 조회 실패:', error);
      return {
        success: false,
        message: '학생 직접평가 데이터 조회에 실패했습니다.'
      };
    }
  });

  /**
   * 특정 직접평가 데이터 조회
   */
  ipcMain.handle('get-direct-evaluation-by-id', async (event, payload) => {
    try {
      const { subject, studentNumber, evaluationId } = payload;
      console.log('[DirectEvaluationHandler] 직접평가 ID 조회:', { subject, studentNumber, evaluationId });
      
      const evaluation = getDirectEvaluationById(subject, studentNumber, evaluationId);
      
      return {
        success: true,
        data: evaluation,
        message: evaluation ? '직접평가 데이터를 조회했습니다.' : '해당 직접평가 데이터가 없습니다.'
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 조회 실패:', error);
      return {
        success: false,
        message: '직접평가 데이터 조회에 실패했습니다.'
      };
    }
  });

  /**
   * 직접평가 데이터 삭제
   */
  ipcMain.handle('delete-direct-evaluation', async (event, payload) => {
    try {
      const { subject, studentNumber, evaluationId } = payload;
      console.log('[DirectEvaluationHandler] 직접평가 삭제 요청:', { subject, studentNumber, evaluationId });
      
      const success = deleteDirectEvaluation(subject, studentNumber, evaluationId);
      
      return {
        success,
        message: success ? '직접평가를 삭제했습니다.' : '삭제할 직접평가 데이터가 없습니다.'
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 삭제 실패:', error);
      return {
        success: false,
        message: '직접평가 삭제에 실패했습니다.'
      };
    }
  });

  /**
   * 과목별 모든 직접평가 데이터 조회 (통계/관리용)
   */
  ipcMain.handle('get-all-direct-evaluations', async (event, payload) => {
    try {
      const { subject } = payload;
      console.log('[DirectEvaluationHandler] 전체 직접평가 조회:', subject);
      
      const evaluations = getAllDirectEvaluations(subject);
      
      return {
        success: true,
        data: evaluations,
        message: `${evaluations.length}건의 직접평가 데이터를 조회했습니다.`
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 전체 조회 실패:', error);
      return {
        success: false,
        message: '전체 직접평가 데이터 조회에 실패했습니다.'
      };
    }
  });

  /**
   * 평가항목별 완료 현황 조회
   */
  ipcMain.handle('get-evaluation-completion-status', async (event, payload) => {
    try {
      const { evaluationId } = payload;
      console.log('[DirectEvaluationHandler] 완료 현황 조회:', evaluationId);
      
      const completionStatus = getEvaluationCompletionStatus(evaluationId);
      
      return {
        success: true,
        data: completionStatus,
        message: '평가 완료 현황을 조회했습니다.'
      };
    } catch (error) {
      console.error('[DirectEvaluationHandler] 완료 현황 조회 실패:', error);
      return {
        success: false,
        message: '평가 완료 현황 조회에 실패했습니다.'
      };
    }
  });

  console.log('[DirectEvaluationHandler] 직접평가 핸들러 등록 완료');
}