// src/common/types/electron.d.ts

interface ElectronAPI {
  send: (channel: string, data: any) => void;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback?: (...args: any[]) => void) => void;
  invoke: (channel: string, data: any) => Promise<any>;
  onAnswerCheck: (callback: (data: any) => void) => void;
  sseStart: (info: any) => Promise<any>;
  // 🔧 Dialog API 추가
  showMessageBox: (options: any) => Promise<any>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    electronAPI: ElectronAPI; // 실제 사용하는 API
  }
}

export {};