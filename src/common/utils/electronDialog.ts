// electronDialog.ts - Electron 안전한 다이얼로그 유틸리티

/**
 * alert() 대신 사용하는 안전한 Electron 다이얼로그
 */
export async function electronAlert(message: string, title: string = '알림'): Promise<void> {
  try {
    await window.electronAPI.showMessageBox({
      type: 'info',
      title,
      message,
      buttons: ['확인']
    });
  } catch (error) {
    console.error('electronAlert 실패:', error);
    // fallback으로 console.log 사용
    console.log(`[ALERT] ${title}: ${message}`);
  }
}

/**
 * confirm() 대신 사용하는 안전한 Electron 다이얼로그
 * @returns true: 확인, false: 취소
 */
export async function electronConfirm(message: string, title: string = '확인'): Promise<boolean> {
  try {
    const result = await window.electronAPI.showMessageBox({
      type: 'question',
      title,
      message,
      buttons: ['취소', '확인'],
      defaultId: 1,    // 기본값: 확인
      cancelId: 0      // ESC/X버튼: 취소
    });
    
    // response === 1이면 '확인', 0이면 '취소'
    return result.response === 1;
    
  } catch (error) {
    console.error('electronConfirm 실패:', error);
    // fallback으로 console.log 사용하고 false 반환
    console.log(`[CONFIRM] ${title}: ${message} (자동으로 취소됨)`);
    return false;
  }
}

/**
 * 사용자 정의 버튼이 있는 고급 다이얼로그
 */
export async function electronChoice(
  message: string, 
  buttons: string[], 
  title: string = '선택'
): Promise<number> {
  try {
    const result = await window.electronAPI.showMessageBox({
      type: 'question',
      title,
      message,
      buttons,
      defaultId: 0,
      cancelId: buttons.length - 1
    });
    
    return result.response;
    
  } catch (error) {
    console.error('electronChoice 실패:', error);
    return -1; // 오류 시 -1 반환
  }
}

/**
 * 위험한 동작 확인용 (빨간색 경고)
 */
export async function electronWarningConfirm(
  message: string, 
  title: string = '경고'
): Promise<boolean> {
  try {
    const result = await window.electronAPI.showMessageBox({
      type: 'warning',
      title,
      message,
      buttons: ['취소', '계속'],
      defaultId: 0,    // 기본값: 취소 (안전)
      cancelId: 0
    });
    
    return result.response === 1;
    
  } catch (error) {
    console.error('electronWarningConfirm 실패:', error);
    return false;
  }
}

/**
 * 오류 메시지 표시
 */
export async function electronError(message: string, title: string = '오류'): Promise<void> {
  try {
    await window.electronAPI.showMessageBox({
      type: 'error',
      title,
      message,
      buttons: ['확인']
    });
  } catch (error) {
    console.error('electronError 실패:', error);
    console.error(`[ERROR] ${title}: ${message}`);
  }
}
