import { useCallback } from 'react';

// 타입 정의
type ElectronCallback = (...args: any[]) => void;

export function useElectron() {
  // 메시지 전송 (단방향)
  const send = useCallback((channel: string, data: any): void => {
    (window as any).electronAPI.send(channel, data);
  }, []);
  
  // 메시지 수신 (이벤트 리스너 등록)
  const receive = useCallback((channel: string, callback: ElectronCallback): void => {
    (window as any).electronAPI.on(channel, callback);
  }, []);
  
  // 이벤트 리스너 제거
  const removeListener = useCallback((channel: string): void => {
    (window as any).electronAPI.removeAllListeners(channel);
  }, []);

  // invoke (요청-응답)
  const invoke = useCallback((channel: string, data: any): Promise<any> => {
    return (window as any).electronAPI.invoke(channel, data);
  }, []);

  return { send, receive, removeListener, invoke };
}
