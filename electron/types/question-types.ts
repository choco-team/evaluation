// 질문 항목의 인터페이스 정의
export interface Question {
    id: string;
    title: string;
    createdAt: string;
    subject: string;
    
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
  