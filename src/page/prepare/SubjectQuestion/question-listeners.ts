import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionDetail, OperationResult, AnswerSheetItem } from '../../../common/types/question-types';

// ---- 타입 정의 ----

// get-question-list-response 타입
type QuestionListResponse = {
  success: boolean;
  data?: Question[];
  message: string;
};

// get-exam-response 타입
type ExamResponse = {
  success: boolean;
  url?: string;
  message: string;
};

// get-question-edit-response 타입
type QuestionEditResponse = {
  success: boolean;
  data?: QuestionDetail;
  message: string;
};

// delete-question-response 타입 = OperationResult 재사용

// setter 함수 타입
type SetState<T> = (value: T) => void;

// send 함수 타입
type SendFunction = (channel: string, payload?: any) => void;

// ---- 리스너 함수들 ----

export const handleQuestionListResponse = (
  result: QuestionListResponse,
  setQuestions: SetState<Question[]>,
  setOperationResult: SetState<OperationResult>,
  setIsLoading: SetState<boolean>,
): void => {
  setIsLoading(false);
  if (result.success && result.data) {
    setQuestions(result.data);
    setOperationResult({ success: true, message: '' });
  } else {
    setOperationResult({ success: false, message: result.message });
  }
};

export const handleExamResponse = (
  result: ExamResponse,
  send: SendFunction,
  setOperationResult: SetState<OperationResult>,
  setIsLoading: SetState<boolean>,
): void => {
  setIsLoading(false);
  if (result.success && result.url) {
    send('open-exam-window', { url: result.url });
  } else {
    setOperationResult({ success: false, message: result.message });
  }
};

export const handleQuestionEditResponse = (
    result: QuestionEditResponse,
    setSelectedSubject: SetState<string>,
    setTitle: SetState<string>,
    setComment: SetState<string>,
    setContent: SetState<string>,
    setAnswerSheet: (answerSheet: AnswerSheetItem[], correctAnswers: any) => void,
    setQuestionId: SetState<number | undefined>,
    setCurrentPage: (page: string, data?: any) => void, // pageData 매개변수 추가
    setOperationResult: SetState<OperationResult>,
    setIsLoading: SetState<boolean>,
  ) => {
    setIsLoading(false);
  
    if (result.success && result.data) {
      const data = result.data;
  
      // 평가 타입에 따른 페이지 분기
      const evaluationType = data.evaluationType || 'answer'; // 기본값은 답안평가
      
      if (evaluationType === 'direct') {
        // 직접평가인 경우: DirectEvaluationCreator로 이동 (평가 항목 수정)
        console.log('[question-listeners] 직접평가 항목 수정 페이지로 이동:', data);
        setCurrentPage('DirectEvaluationCreator', {
          evaluationId: data.id,
          title: data.title,
          description: data.comment,
          subject: data.subject, // 수정 모드에서 과목 정보 전달
          isEditMode: true // 수정 모드 플래그
        });
      } else {
        // 답안평가인 경우: 기존 WritingPage로 이동
        console.log('[question-listeners] 답안평가 수정 페이지로 이동:', data);
        
        const answerSheetWithIds = data.answerSheet.map((item: AnswerSheetItem) => ({
          ...item,
          id: item.id || uuidv4(),
        }));
    
        let numId: number | undefined = undefined;
        if (typeof data.id === 'string') {
          const parsed = parseInt(data.id, 10);
          if (!isNaN(parsed)) {
            numId = parsed;
          }
        } else if (typeof data.id === 'number') {
          numId = data.id;
        }
    
        setQuestionId(numId);
        setSelectedSubject(data.subject ?? '');
        setTitle(data.title ?? '');
        setComment(data.comment ?? '');
        setContent(data.content ?? '');
        setAnswerSheet(answerSheetWithIds, data.correctAnswer);
        setCurrentPage('WritingPage');
      }
    } else {
      setOperationResult({ success: false, message: result.message });
    }
  };
  

export const handleDeleteResponse = (
  result: OperationResult,
  getQuestionList: () => void,
  setOperationResult: SetState<OperationResult>,
  setIsLoading: SetState<boolean>,
): void => {
  setIsLoading(false);
  setOperationResult(result);
  if (result.success) {
    getQuestionList();
  }
};
