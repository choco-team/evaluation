# Electron 아키텍처 가이드

## 목차
1. [Electron 아키텍처 개요](#electron-아키텍처-개요)
2. [메인 프로세스 구조](#메인-프로세스-구조)
3. [렌더러 프로세스 구조](#렌더러-프로세스-구조)
4. [프리로드 스크립트](#프리로드-스크립트)
5. [IPC 통신 패턴](#ipc-통신-패턴)
6. [핸들러 시스템](#핸들러-시스템)
7. [파일 시스템 관리](#파일-시스템-관리)
8. [윈도우 관리](#윈도우-관리)
9. [SSE 통신 관리](#sse-통신-관리)
10. [보안 고려사항](#보안-고려사항)
11. [성능 최적화](#성능-최적화)

## Electron 아키텍처 개요

### 프로세스 모델
```
┌─────────────────────────────────────────────────────────────┐
│                     메인 프로세스 (Node.js)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   윈도우 관리    │  │   IPC 핸들러    │  │  파일 관리   │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   SSE 매니저    │  │   경로 관리     │  │  세션 관리   │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │ IPC 통신
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   렌더러 프로세스 (Chromium)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 프리로드 스크립트                        │ │
│  │        (메인-렌더러 간 안전한 통신 브릿지)                │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  React 애플리케이션                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │    페이지    │  │  상태 관리   │  │  컴포넌트    │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 개념
- **메인 프로세스**: Node.js 환경, 시스템 리소스 접근, 윈도우 생성/관리
- **렌더러 프로세스**: Chromium 환경, React 앱 실행, 제한된 시스템 접근
- **프리로드 스크립트**: 보안 브릿지 역할, contextBridge API 제공
- **IPC 통신**: 프로세스 간 안전한 데이터 교환

## 메인 프로세스 구조

### 메인 프로세스 진입점 (`electron/main.ts`)
```typescript
import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windowManager';
import { registerAllHandlers } from './ipcHandlers';
import { initializeSSEManager } from './sseManager';

class Application {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // 앱 이벤트 리스너 등록
    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('activate', this.onActivate);
  }

  private async onReady(): Promise<void> {
    // 1. 보안 설정
    this.setupSecurity();
    
    // 2. IPC 핸들러 등록
    registerAllHandlers();
    
    // 3. SSE 매니저 초기화
    initializeSSEManager();
    
    // 4. 메인 윈도우 생성
    this.mainWindow = await createMainWindow();
  }

  private setupSecurity(): void {
    // CSP, 권한 등 보안 설정
  }
}

new Application();
```

### 모듈별 역할 분담

#### 1. 윈도우 관리 (`electron/windowManager.ts`)
```typescript
import { BrowserWindow, screen } from 'electron';
import { join } from 'path';

interface WindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  webPreferences: Electron.WebPreferences;
}

export class WindowManager {
  private static instance: WindowManager;
  private mainWindow: BrowserWindow | null = null;

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  async createMainWindow(): Promise<BrowserWindow> {
    const config = this.getWindowConfig();
    
    this.mainWindow = new BrowserWindow(config);
    
    // 개발/프로덕션 환경별 로딩
    if (process.env.NODE_ENV === 'development') {
      await this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      await this.mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }

    this.setupWindowEvents();
    return this.mainWindow;
  }

  private getWindowConfig(): WindowConfig {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    return {
      width: Math.min(1400, width * 0.8),
      height: Math.min(900, height * 0.8),
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,          // 보안상 비활성화
        contextIsolation: true,          // 컨텍스트 격리 활성화
        preload: join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    };
  }
}
```

#### 2. IPC 핸들러 등록 (`electron/ipcHandlers.ts`)
```typescript
import { registerStudentHandlers } from './handlers/studentHandlers';
import { registerSubjectHandlers } from './handlers/subjectHandlers';
import { registerDocumentHandlers } from './handlers/documentHandlers';
// ... 기타 핸들러들

export function registerAllHandlers(): void {
  console.log('Registering all IPC handlers...');
  
  // 각 도메인별 핸들러 등록
  registerStudentHandlers();
  registerSubjectHandlers();
  registerDocumentHandlers();
  registerQuestionHandlers();
  registerAnswerDataHandlers();
  registerPromptTemplateHandlers();
  registerPromptCreatingHandlers();
  registerDirectEvaluationHandlers();
  registerSessionHandlers();
  registerSSEHandlers();
  
  console.log('All IPC handlers registered successfully');
}

// 핸들러 등록 해제 (앱 종료 시)
export function unregisterAllHandlers(): void {
  // 필요시 핸들러 정리 로직
}
```

#### 3. 경로 관리 (`electron/pathManager.ts`)
```typescript
import { app } from 'electron';
import { join } from 'path';
import { homedir } from 'os';

export class PathManager {
  private static readonly APP_NAME = 'teachercan_evaluation';
  
  // 애플리케이션 데이터 경로들
  static getAppDataPath(): string {
    return join(app.getPath('userData'), PathManager.APP_NAME);
  }
  
  static getStudentsDataPath(): string {
    return join(this.getAppDataPath(), 'students');
  }
  
  static getSubjectsDataPath(): string {
    return join(this.getAppDataPath(), 'subjects');
  }
  
  static getTemplatesPath(): string {
    return join(this.getAppDataPath(), 'templates');
  }
  
  static getSessionsPath(): string {
    return join(this.getAppDataPath(), 'sessions');
  }
  
  static getTempPath(): string {
    return join(this.getAppDataPath(), 'temp');
  }
  
  // 사용자 문서 경로들
  static getUserDocumentsPath(): string {
    return app.getPath('documents');
  }
  
  static getUserDesktopPath(): string {
    return app.getPath('desktop');
  }
  
  // 경로 초기화 (앱 시작 시 실행)
  static async initializePaths(): Promise<void> {
    const paths = [
      this.getAppDataPath(),
      this.getStudentsDataPath(),
      this.getSubjectsDataPath(),
      this.getTemplatesPath(),
      this.getSessionsPath(),
      this.getTempPath(),
    ];
    
    for (const path of paths) {
      await this.ensureDirectoryExists(path);
    }
  }
}
```

## 렌더러 프로세스 구조

### React 애플리케이션 아키텍처
```
src/
├── main.tsx              # React 앱 진입점
├── App.tsx               # 루트 컴포넌트
├── common/               # 공통 모듈
│   ├── store/           # Zustand 상태 관리
│   ├── types/           # TypeScript 타입
│   └── utils/           # 유틸리티 함수
└── page/                # 페이지별 컴포넌트
    ├── prepare/         # 평가 준비
    ├── upload/          # 파일 업로드
    ├── qrcode/          # QR 코드 생성
    └── promptTemplate/  # 프롬프트 템플릿
```

### Electron API 사용 패턴
```typescript
// src/common/useElectron.ts
import { useCallback } from 'react';

export const useElectron = () => {
  const openFile = useCallback(async (filters?: any[]) => {
    try {
      return await window.electronAPI.dialog.openFile(filters);
    } catch (error) {
      console.error('Failed to open file:', error);
      throw error;
    }
  }, []);

  const saveFile = useCallback(async (data: string, defaultPath?: string) => {
    try {
      return await window.electronAPI.file.save(data, defaultPath);
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }, []);

  return {
    openFile,
    saveFile,
    // 기타 Electron API 래핑 함수들
  };
};
```

## 프리로드 스크립트

### 보안 브릿지 역할 (`electron/preload.js`)
```javascript
const { contextBridge, ipcRenderer } = require('electron');

// 안전한 API만 렌더러에 노출
contextBridge.exposeInMainWorld('electronAPI', {
  // 학생 관련 API
  student: {
    getAll: () => ipcRenderer.invoke('student:getAll'),
    create: (studentData) => ipcRenderer.invoke('student:create', studentData),
    update: (id, updates) => ipcRenderer.invoke('student:update', id, updates),
    delete: (id) => ipcRenderer.invoke('student:delete', id),
  },

  // 파일 관련 API
  file: {
    read: (filePath) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath, data) => ipcRenderer.invoke('file:write', filePath, data),
    parse: (filePath, type) => ipcRenderer.invoke('file:parse', filePath, type),
  },

  // 다이얼로그 API
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
    showMessage: (options) => ipcRenderer.invoke('dialog:showMessage', options),
  },

  // SSE 관련 API
  sse: {
    connect: (url) => ipcRenderer.invoke('sse:connect', url),
    disconnect: () => ipcRenderer.invoke('sse:disconnect'),
    onMessage: (callback) => {
      ipcRenderer.on('sse:message', (event, data) => callback(data));
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('sse:message');
    },
  },

  // 앱 정보 API
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
    quit: () => ipcRenderer.invoke('app:quit'),
  },
});

// 렌더러에서 사용할 타입 정의도 함께 제공
contextBridge.exposeInMainWorld('electronAPITypes', {
  // TypeScript 인터페이스 정보 (런타임에서는 사용 안됨)
});
```

### 타입 정의 (`src/common/types/electron.d.ts`)
```typescript
interface StudentAPI {
  getAll: () => Promise<Student[]>;
  create: (studentData: Omit<Student, 'id'>) => Promise<Student>;
  update: (id: string, updates: Partial<Student>) => Promise<Student>;
  delete: (id: string) => Promise<void>;
}

interface FileAPI {
  read: (filePath: string) => Promise<string>;
  write: (filePath: string, data: string) => Promise<void>;
  parse: (filePath: string, type: 'hwp' | 'docx' | 'pdf') => Promise<string>;
}

interface DialogAPI {
  openFile: (options?: Electron.OpenDialogOptions) => Promise<string | null>;
  saveFile: (options?: Electron.SaveDialogOptions) => Promise<string | null>;
  showMessage: (options: Electron.MessageBoxOptions) => Promise<number>;
}

interface SSEAPI {
  connect: (url: string) => Promise<void>;
  disconnect: () => Promise<void>;
  onMessage: (callback: (data: any) => void) => void;
  removeAllListeners: () => void;
}

interface AppAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  quit: () => Promise<void>;
}

interface ElectronAPI {
  student: StudentAPI;
  file: FileAPI;
  dialog: DialogAPI;
  sse: SSEAPI;
  app: AppAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

## IPC 통신 패턴

### 핸들러 구현 패턴
```typescript
// electron/handlers/studentHandlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Student } from '../types/student';
import { FileManager } from '../fileManager/FileManager';

export function registerStudentHandlers(): void {
  ipcMain.handle('student:getAll', handleGetAllStudents);
  ipcMain.handle('student:create', handleCreateStudent);
  ipcMain.handle('student:update', handleUpdateStudent);
  ipcMain.handle('student:delete', handleDeleteStudent);
}

async function handleGetAllStudents(
  event: IpcMainInvokeEvent
): Promise<Student[]> {
  try {
    const fileManager = FileManager.getInstance();
    const students = await fileManager.loadStudents();
    return students;
  } catch (error) {
    console.error('Failed to get students:', error);
    throw new Error(`학생 목록 조회 실패: ${error.message}`);
  }
}

async function handleCreateStudent(
  event: IpcMainInvokeEvent,
  studentData: Omit<Student, 'id'>
): Promise<Student> {
  try {
    // 유효성 검사
    validateStudentData(studentData);
    
    const fileManager = FileManager.getInstance();
    const newStudent = await fileManager.createStudent(studentData);
    
    return newStudent;
  } catch (error) {
    console.error('Failed to create student:', error);
    throw new Error(`학생 생성 실패: ${error.message}`);
  }
}

function validateStudentData(data: Omit<Student, 'id'>): void {
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('학생 이름은 필수입니다.');
  }
  
  if (!data.studentNumber || data.studentNumber.trim().length === 0) {
    throw new Error('학번은 필수입니다.');
  }
  
  // 추가 유효성 검사...
}
```

### 에러 처리 패턴
```typescript
// 공통 에러 처리 미들웨어
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // 로깅
      console.error('IPC Handler Error:', error);
      
      // 에러 변환 (보안상 민감한 정보 제거)
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('알 수 없는 오류가 발생했습니다.');
      }
    }
  };
}

// 사용 예시
ipcMain.handle('student:create', withErrorHandling(handleCreateStudent));
```

## 핸들러 시스템

### 도메인별 핸들러 구조
```
electron/handlers/
├── studentHandlers.ts       # 학생 관리
├── subjectHandlers.ts       # 과목 관리  
├── questionHandlers.ts      # 문제 관리
├── answerDataHandler.ts     # 답안 데이터
├── documentHandlers.ts      # 문서 처리
├── promptTemplateHandlers.ts # 프롬프트 템플릿
├── promptCreatingHandlers.ts # 프롬프트 생성
├── directEvaluationHandlers.ts # 직접 평가
├── sessionHandler.ts        # 세션 관리
└── sseHandler.ts           # SSE 통신
```

### 핸들러 베이스 클래스
```typescript
// electron/handlers/BaseHandler.ts
export abstract class BaseHandler {
  protected abstract readonly namespace: string;
  
  abstract registerHandlers(): void;
  
  protected handle<T extends any[], R>(
    channel: string,
    handler: (...args: T) => Promise<R>
  ): void {
    const fullChannel = `${this.namespace}:${channel}`;
    ipcMain.handle(fullChannel, withErrorHandling(handler));
  }
  
  protected handleSync<T extends any[], R>(
    channel: string,
    handler: (...args: T) => R
  ): void {
    const fullChannel = `${this.namespace}:${channel}`;
    ipcMain.on(fullChannel, (event, ...args) => {
      try {
        const result = handler(...args);
        event.returnValue = result;
      } catch (error) {
        event.returnValue = { error: error.message };
      }
    });
  }
}

// 구현 예시
export class StudentHandler extends BaseHandler {
  protected readonly namespace = 'student';
  
  registerHandlers(): void {
    this.handle('getAll', this.getAllStudents);
    this.handle('create', this.createStudent);
    this.handle('update', this.updateStudent);
    this.handle('delete', this.deleteStudent);
  }
  
  private getAllStudents = async (): Promise<Student[]> => {
    // 구현...
  };
}
```

## 파일 시스템 관리

### 파일 매니저 구조
```typescript
// electron/fileManager/FileManager.ts
export class FileManager {
  private static instance: FileManager;
  
  static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  // 학생 데이터 관리
  async loadStudents(): Promise<Student[]> {
    const filePath = join(PathManager.getStudentsDataPath(), 'students.json');
    return this.loadJsonFile<Student[]>(filePath, []);
  }

  async saveStudents(students: Student[]): Promise<void> {
    const filePath = join(PathManager.getStudentsDataPath(), 'students.json');
    await this.saveJsonFile(filePath, students);
  }

  // 문서 파일 파싱
  async parseDocument(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.hwp':
        return this.parseHwpFile(filePath);
      case '.docx':
        return this.parseDocxFile(filePath);
      case '.pdf':
        return this.parsePdfFile(filePath);
      default:
        throw new Error(`지원하지 않는 파일 형식: ${ext}`);
    }
  }

  // 공통 파일 처리 메서드들
  private async loadJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      if (!(await this.fileExists(filePath))) {
        return defaultValue;
      }
      
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load JSON file: ${filePath}`, error);
      return defaultValue;
    }
  }

  private async saveJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      await this.ensureDirectoryExists(path.dirname(filePath));
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error(`Failed to save JSON file: ${filePath}`, error);
      throw error;
    }
  }
}
```

## 윈도우 관리

### 다중 윈도우 관리
```typescript
// electron/windowManager.ts
export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  
  async createWindow(
    id: string, 
    config: WindowConfig,
    url?: string
  ): Promise<BrowserWindow> {
    if (this.windows.has(id)) {
      const existingWindow = this.windows.get(id)!;
      existingWindow.focus();
      return existingWindow;
    }
    
    const window = new BrowserWindow(config);
    this.windows.set(id, window);
    
    // 윈도우 이벤트 처리
    window.on('closed', () => {
      this.windows.delete(id);
    });
    
    if (url) {
      await window.loadURL(url);
    }
    
    return window;
  }
  
  getWindow(id: string): BrowserWindow | null {
    return this.windows.get(id) || null;
  }
  
  closeWindow(id: string): void {
    const window = this.windows.get(id);
    if (window) {
      window.close();
    }
  }
  
  closeAllWindows(): void {
    this.windows.forEach(window => window.close());
    this.windows.clear();
  }
}
```

## SSE 통신 관리

### SSE 매니저 구조
```typescript
// electron/sseManager/SSEManager.ts
import EventSource from 'eventsource';

export class SSEManager {
  private static instance: SSEManager;
  private eventSource: EventSource | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  
  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }
  
  async connect(url: string): Promise<void> {
    this.disconnect(); // 기존 연결 해제
    
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      console.log('SSE connection opened');
      this.clearReconnectTimer();
    };
    
    this.eventSource.onmessage = (event) => {
      this.handleMessage(event.data);
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.scheduleReconnect(url);
    };
  }
  
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.clearReconnectTimer();
  }
  
  private handleMessage(data: string): void {
    try {
      const parsedData = JSON.parse(data);
      
      // 모든 렌더러 프로세스에 메시지 전달
      BrowserWindow.getAllWindows().forEach(window => {
        window.webContents.send('sse:message', parsedData);
      });
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  }
  
  private scheduleReconnect(url: string): void {
    this.clearReconnectTimer();
    
    this.reconnectInterval = setTimeout(() => {
      console.log('Attempting to reconnect SSE...');
      this.connect(url);
    }, 5000); // 5초 후 재연결
  }
  
  private clearReconnectTimer(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }
}
```

## 보안 고려사항

### 1. 컨텍스트 격리
```typescript
// 메인 윈도우 생성 시 보안 설정
const secureConfig = {
  webPreferences: {
    nodeIntegration: false,              // Node.js API 비활성화
    contextIsolation: true,              // 컨텍스트 격리 활성화
    enableRemoteModule: false,           // Remote 모듈 비활성화
    allowRunningInsecureContent: false,  // 비보안 콘텐츠 차단
    webSecurity: true,                   // 웹 보안 활성화
    preload: path.join(__dirname, 'preload.js'),
  },
};
```

### 2. 입력 데이터 검증
```typescript
// 모든 IPC 핸들러에서 입력 검증 필수
function validateInput(data: unknown, schema: any): void {
  // 스키마 검증 로직
  if (!isValidData(data, schema)) {
    throw new Error('Invalid input data');
  }
}

// SQL Injection 방지 (파일 경로 검증)
function validateFilePath(filePath: string): void {
  const normalized = path.normalize(filePath);
  const allowedPaths = [PathManager.getUserDocumentsPath()];
  
  if (!allowedPaths.some(allowed => normalized.startsWith(allowed))) {
    throw new Error('Unauthorized file access');
  }
}
```

### 3. 파일 시스템 접근 제한
```typescript
// 안전한 파일 접근 래퍼
class SecureFileManager {
  private readonly allowedExtensions = ['.hwp', '.docx', '.pdf', '.json'];
  private readonly allowedPaths: string[];
  
  constructor() {
    this.allowedPaths = [
      PathManager.getAppDataPath(),
      PathManager.getUserDocumentsPath(),
      PathManager.getUserDesktopPath(),
    ];
  }
  
  async readFile(filePath: string): Promise<string> {
    this.validateAccess(filePath);
    return fs.readFile(filePath, 'utf8');
  }
  
  private validateAccess(filePath: string): void {
    const normalized = path.normalize(filePath);
    const ext = path.extname(normalized);
    
    // 확장자 검증
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(`Unauthorized file extension: ${ext}`);
    }
    
    // 경로 검증
    if (!this.allowedPaths.some(allowed => normalized.startsWith(allowed))) {
      throw new Error('Unauthorized file access');
    }
  }
}
```

## 성능 최적화

### 1. 메모리 관리
```typescript
// 대용량 파일 처리 시 스트림 사용
async function processLargeFile(filePath: string): Promise<void> {
  const readStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(outputPath);
  
  return new Promise((resolve, reject) => {
    readStream
      .pipe(transform)
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

// 메모리 사용량 모니터링
function monitorMemory(): void {
  const memUsage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
  });
}
```

### 2. IPC 통신 최적화
```typescript
// 배치 처리로 IPC 호출 최소화
class BatchProcessor {
  private queue: any[] = [];
  private timer: NodeJS.Timeout | null = null;
  
  add(item: any): void {
    this.queue.push(item);
    this.scheduleProcess();
  }
  
  private scheduleProcess(): void {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.processBatch();
      this.timer = null;
    }, 100); // 100ms 배치
  }
  
  private processBatch(): void {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    
    // 배치 처리
    this.handleBatch(batch);
  }
}
```

### 3. 캐싱 전략
```typescript
// 메모리 캐시 구현
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly ttl: number;
  
  constructor(ttlMs: number = 5 * 60 * 1000) { // 5분 TTL
    this.ttl = ttlMs;
  }
  
  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
}
```

이 Electron 아키텍처 가이드는 프로젝트의 복잡한 구조를 체계적으로 이해하고, 안전하고 효율적인 개발을 위한 패턴들을 제공합니다.
