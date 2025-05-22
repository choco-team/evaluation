import { create } from 'zustand';

// 페이지 이동용
interface PageState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

// 페이지 상태 store
export const usePageStore = create<PageState>((set) => ({
  currentPage: 'prepare', // 기본값은 '준비 페이지'
  setCurrentPage: (page) => set({ currentPage: page }),
}));


// 세션 정보 상태 store
interface SessionInfoState {
  endpoint: string;
  setEndpoint: (endpoint: string) => void;

  qrcodeLink: string;
  setQrcodeLink: (qrcodeLink: string) => void;

  subject: string;
  setSubject: (subject: string) => void;

  examId: string;
  setExamId: (examId: string) => void;

  clearSessionInfo: () => void;
}

export const useSessionInfoStore = create<SessionInfoState>((set) => ({
  endpoint: '',
  qrcodeLink: '',
  subject: '',
  examId: '',

  setEndpoint: (endpoint) => set({ endpoint }),
  setQrcodeLink: (qrcodeLink) => set({ qrcodeLink }),
  setSubject: (subject) => set({ subject }),
  setExamId: (examId) => set({ examId }),

  clearSessionInfo: () =>
    set({
      endpoint: '',
      qrcodeLink: '',
      subject: '',
      examId: '',
    }),
}));
