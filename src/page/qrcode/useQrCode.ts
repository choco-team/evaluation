import { useCallback } from 'react';

export function useQrCode() {
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

  const copyToClipboard = useCallback((text: string) => {
    if (!text) {
      console.warn('복사할 텍스트가 없습니다.');
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('복사 성공:', text);
        window.electronAPI.showMessageBox('URL이 복사되었습니다!');
      })
      .catch((err) => {
        console.error('복사 실패:', err);
      });
  }, []);

  return { generateQRCode, copyToClipboard };
}
