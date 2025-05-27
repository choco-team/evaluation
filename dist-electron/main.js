import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerIpcHandlers } from './ipcHandlers.js'; // 실제 경로에 맞게 수정
import { setMainWindow } from './windowManager.js';
const isDev = !app.isPackaged;
// ESM 환경에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 프로젝트 루트 경로 = dist-electron 상위
const rootPath = path.resolve(__dirname, '..');
// 개발환경에서만 사용
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
// 개발 모드 여부 확인
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'assets', 'teachercan.ico'),
        frame: true, // 닫기/최소화/최대화 버튼 있는 기본 창 테두리 사용
        autoHideMenuBar: true, // Alt 누르면만 메뉴바 잠깐 표시됨 (Windows 기준)
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.setMenu(null); // 메뉴 완전 제거
    mainWindow.loadFile(isDev
        ? path.join(rootPath, 'dist', 'index.html')
        : path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'));
    // mainWindow.webContents.openDevTools();
    setMainWindow(mainWindow);
}
app.whenReady().then(() => {
    createWindow();
    registerIpcHandlers(); // 👈 이거 꼭 호출해야 ipcMain 리스너 작동함
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
