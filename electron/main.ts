import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerIpcHandlers } from './ipcHandlers.js'; // 실제 경로에 맞게 수정
import { ipcMain } from 'electron';

const isDev = !app.isPackaged;

let examWindow: BrowserWindow | null = null;


// ESM 환경에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 프로젝트 루트 경로 = dist-electron 상위
const rootPath = path.resolve(__dirname, '..');



ipcMain.on('open-exam-window', (event, { url, endpoint }) => {
  if (examWindow) {
    examWindow.focus();
    return;
  }

  examWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  examWindow.loadFile(
    isDev
      ? path.join(rootPath, 'dist', 'qr.html')   // dev에서는 /dist/qr.html
      : path.join(__dirname, 'dist', 'qr.html')   // prod에서는 /dist-electron/dist/qr.html
  );
    examWindow.webContents.openDevTools();

  // QR창이 다 로드되면 데이터 보내기
  examWindow.webContents.once('did-finish-load', () => {
    if (examWindow) {
      examWindow.webContents.send('exam-data', { url, endpoint });
    }
  });
    examWindow.on('closed', () => {
    examWindow = null;
  });
});





// 개발 모드 여부 확인
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname,'preload.js'), 
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile(
    isDev
      ? path.join(rootPath, 'dist', 'index.html')
      : path.join(__dirname, 'dist', 'index.html')
  );
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  registerIpcHandlers(); // 👈 이거 꼭 호출해야 ipcMain 리스너 작동함

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
