// 평가 타입 정의
export type EvaluationType = 'answer' | 'direct';

// 평가항목 인터페이스 (기존 Question에서 변경)
export interface EvaluationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string; // 수정 시간 추가
  subject: string;
  evaluationType?: EvaluationType; // 선택사항으로 변경 (백엔드 호환성)
  comment?: string; // 백엔드와 일치하도록 comment 속성 추가
  description?: string; // 평가항목 설명 (선택사항, 하위 호환성용)
}

// API 응답 결과 인터페이스
export interface OperationResult {
  success: boolean;
  message: string;
}

// 답안지 항목 인터페이스 - 스토어와 일치하도록
export interface AnswerSheetItem {
  id: string;
  format: 'select' | 'input' | 'textarea';
  counts?: number;
}

// 정답 타입 - 스토어와 일치하도록
export type CorrectAnswerItem = number | string;

// 평가항목 상세 데이터 인터페이스 (기존 QuestionDetail에서 변경)
export interface EvaluationDetail {
  id?: string;
  subject: string;
  comment: string;
  content: string | null;
  title: string | null;
  evaluationType: EvaluationType; // 평가 타입 추가
  answerSheet: AnswerSheetItem[]; // 답안평가의 경우에만 사용
  correctAnswer: CorrectAnswerItem[]; // 답안평가의 경우에만 사용
  createdAt: Date;
  updatedAt?: Date; // 수정 시간 추가
}

// 직접평가 결과 인터페이스 (새로 추가)
export interface DirectEvaluationResult {
  evaluationId: string;
  studentNumber: number; // 기존 Student 구조에 맞게 studentNumber 사용
  studentName: string;
  result: string; // 교사가 입력한 평가 내용
  score?: number; // 점수 (선택사항)
  createdAt: string;
  updatedAt?: string;
}

// 하위 호환성을 위한 기존 타입들 (추후 단계적으로 제거)
export type Question = EvaluationItem;
export type QuestionDetail = EvaluationDetail;
  