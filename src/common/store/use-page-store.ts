import { create } from 'zustand';

// 페이지 스토어 상태 타입 정의
interface PageState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const usePageStore = create<PageState>((set) => ({
  currentPage: 'prepare', // 기본 페이지는 준비 페이지
  setCurrentPage: (page) => set({ currentPage: page }),
}));