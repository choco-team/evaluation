import { useCallback } from 'react';
import { useElectron } from '../../common/useElectron';

export function useQrCode() {
  const { invoke } = useElectron();
  
  const generateQRCode = useCallback((canvasId: string, url: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      import('qrcode').then(QRCode => {
        QRCode.toCanvas(canvas, url, { width: 300 }, (error) => {
          if (error) console.error('QR 생성 오류:', error);
        });
      });
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) {
      console.warn('복사할 텍스트가 없습니다.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      console.log('복사 성공:', text);
      await invoke('show-success-dialog', 'URL이 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  }, [invoke]);

  return { generateQRCode, copyToClipboard };
}
