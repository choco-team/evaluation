// ipcHandlers.ts
import { registerAnswerDataHandler } from './handlers/answerDataHandler.js';
import { registerDocumentHandlers } from './handlers/documentHandlers.js';
import { registerPromptCreatingHandlers } from './handlers/promptCreatingHandlers.js';
import { registerPromptTemplateHandlers } from './handlers/promptTemplateHandlers.js';
import { registerQuestionHandlers } from './handlers/questionHandlers.js';
import { registerSessionHandler } from './handlers/sessionHandler.js';
import { registerSSEHandlers } from './handlers/sseHandler.js';
import { registerStudentHandlers } from './handlers/studentHandlers.js';
import { registerSubjectHandlers } from './handlers/subjectHandlers.js';
import { registerDirectEvaluationHandlers } from './handlers/directEvaluationHandlers.js'; // 직접평가 핸들러 추가

export function registerIpcHandlers() {
  registerSubjectHandlers();
  registerStudentHandlers();
  registerQuestionHandlers();
  registerDocumentHandlers();
  registerAnswerDataHandler();
  registerDirectEvaluationHandlers(); // 직접평가 핸들러 등록
  registerSSEHandlers();
  registerSessionHandler();
  registerPromptCreatingHandlers();
  registerPromptTemplateHandlers();
}
