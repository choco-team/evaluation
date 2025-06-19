// 질문 항목의 인터페이스 정의
export interface Question {
    id: string;
    title: string;
    createdAt: string;
    updatedAt?: string; // 수정 시간 추가
    subject: string;
    content: string;
    comment: string;
    correctAnswer: string[];
    evaluationType?: 'answer' | 'direct'; // 평가 타입 추가 (선택사항)
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
  
  // 문제 상세 데이터 인터페이스
  export interface QuestionDetail {
    id?: string;
    subject: string;
    comment: string;
    content: string | null;
    title: string | null;
    answerSheet: AnswerSheetItem[];
    correctAnswer: CorrectAnswerItem[];
    createdAt: Date
  }
  
export interface StudentAnswers {
  [studentNumber: number]: AnswerSheetItem[];
}

// 직접평가 결과 인터페이스
export interface DirectEvaluationResult {
  evaluationId: string;
  studentNumber: number; // 기존 Student 구조에 맞게 studentNumber 사용
  studentName: string;
  result: string; // 교사가 입력한 평가 내용
  score?: number; // 점수 (선택사항)
  createdAt: string;
  updatedAt?: string;
}
