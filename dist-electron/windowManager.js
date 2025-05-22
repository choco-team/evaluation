let mainWindow = null;
export function setMainWindow(win) {
    mainWindow = win;
}
export function getMainWindow() {
    if (!mainWindow)
        throw new Error('mainWindow is not initialized');
    return mainWindow;
}
