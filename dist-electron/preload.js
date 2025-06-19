const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (_, data) => {
      callback(data);
    });
  },
  onAnswerCheck: (callback) => {
    ipcRenderer.on('answer-check', (_, data) => callback(data));
  },
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },

  // ✅ 추가해줘야 함!
  sseStart: (info) => ipcRenderer.invoke('sse-start', info),
  // 🔧 Dialog API 추가
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
});
