// studentsStore.ts
import { create } from 'zustand';
import { Student } from '../types/student';

interface StudentState {
  students: Student[];
  setStudents: (data: Student[]) => void;
  loadStudents: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  setStudents: (data) => set({ students: data }),
  loadStudents: () => {
    // send는 외부에서 바인딩될 예정
    console.warn('loadStudents called before initialization');
  },
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
