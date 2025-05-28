// studentsStore.ts
import { create } from 'zustand';
import { Student } from '../types/student';

export interface StudentAnswerStatus {
  studentNumber: number;
  examId: string;
  status: 'found' | 'missing';
  timestamp: string;
}

export interface StudentState {
  students: Student[];
  setStudents: (data: Student[]) => void;
  loadStudents: () => void;

  // ✅ 새로 추가
  answerStatusLog: StudentAnswerStatus[];
  addAnswerStatus: (data: StudentAnswerStatus) => void;
  resetAnswerStatus: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  setStudents: (data) => set({ students: data }),
  loadStudents: () => {
    // send는 외부에서 바인딩될 예정
    console.warn('loadStudents called before initialization');
  },
    answerStatusLog: [],

    resetAnswerStatus: () => set({ answerStatusLog: [] }),
    
  addAnswerStatus: (entry) =>
  set((state) => {
    if (
      entry &&
      typeof entry.studentNumber === 'number' &&
      typeof entry.examId === 'string' &&
      (entry.status === 'found' || entry.status === 'missing')
    ) {
      return {
        answerStatusLog: [...state.answerStatusLog, entry],
      };
    }

    console.warn('[zustand] 무효한 answerStatusLog entry 무시됨:', entry);
    return {};
  }),
}));

// ❗ init 함수에서 Electron API 바인딩
export function initStudentStore({ send, receive }: { send: Function; receive: Function }) {
  // loadStudents 정의 교체
  useStudentStore.setState({
    loadStudents: () => {
      console.log('[zustand] get-students 요청 전송');
      send('get-students', null);
    },
  });

  receive('get-students-response', (result: { success: boolean; data?: Student[] }) => {
    if (result.success && result.data) {
      console.log('[zustand] get-students 응답 수신');
      useStudentStore.getState().setStudents(result.data);
    }
  });
}
