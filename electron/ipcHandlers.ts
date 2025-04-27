// ipcHandlers.ts
import { registerDocumentHandlers } from './handlers/documentHandlers.js';
import { registerQuestionHandlers } from './handlers/questionHandlers.js';
import { registerStudentHandlers } from './handlers/studentHandlers.js';
import { registerSubjectHandlers } from './handlers/subjectHandlers.js';

export function registerIpcHandlers() {
  registerSubjectHandlers();
  registerStudentHandlers();
  registerQuestionHandlers();
  registerDocumentHandlers();
}
