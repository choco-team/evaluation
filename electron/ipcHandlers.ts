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

export function registerIpcHandlers() {
  registerSubjectHandlers();
  registerStudentHandlers();
  registerQuestionHandlers();
  registerDocumentHandlers();
  registerAnswerDataHandler();
  registerSSEHandlers();
  registerSessionHandler();
  registerPromptCreatingHandlers();
  registerPromptTemplateHandlers();
}
