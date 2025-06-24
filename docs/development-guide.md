# 티처캔 평가 간소화 앱 - 개발 가이드

## 목차
1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 시작하기](#프로젝트-시작하기)
3. [코딩 컨벤션](#코딩-컨벤션)
4. [아키텍처 가이드](#아키텍처-가이드)
5. [새로운 기능 추가하기](#새로운-기능-추가하기)
6. [상태 관리](#상태-관리)
7. [IPC 통신](#ipc-통신)
8. [파일 처리](#파일-처리)
9. [빌드 및 배포](#빌드-및-배포)
10. [문제 해결](#문제-해결)

## 개발 환경 설정

### 필수 요구사항
- **Node.js**: 18.x 이상 (LTS 권장)
- **npm**: 9.x 이상 또는 **yarn**: 1.22.x
- **Git**: 최신 버전
- **VS Code**: 권장 IDE (확장 프로그램 설정 포함)

### VS Code 확장 프로그램 (권장)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

### 프로젝트 클론 및 설치
```bash
# 프로젝트 클론 (실제 저장소 주소로 변경)
git clone <repository-url>
cd local

# 의존성 설치
npm install

# 패치 적용 (postinstall에서 자동 실행)
npm run postinstall
```

## 프로젝트 시작하기

### 개발 서버 실행
```bash
# 개발 모드 (React + Electron 동시 실행)
npm run dev

# 개별 실행
npm run start-electron  # Electron만 실행
vite                     # Vite 개발 서버만 실행
```

### 환경 변수 설정
- `.env.development`: 개발 환경 설정
- `.env.production`: 프로덕션 환경 설정

```env
# .env.development 예시
VITE_API_BASE_URL=http://localhost:3000
VITE_ENV=development
```

## 코딩 컨벤션

### TypeScript
- **타입 정의**: `src/common/types/` 폴더에 모듈별로 분리
- **인터페이스 명명**: PascalCase 사용
- **타입 가드**: 런타임 타입 체크 필요시 구현

```typescript
// 좋은 예
interface StudentInfo {
  id: string;
  name: string;
  grade: number;
}

// 타입 가드 예시
function isStudentInfo(obj: any): obj is StudentInfo {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}
```

### React 컴포넌트
- **함수형 컴포넌트**: 모든 컴포넌트는 함수형으로 작성
- **Hooks**: React 19의 최신 Hook 사용
- **파일 명명**: PascalCase.tsx (예: `StudentList.tsx`)

```typescript
// 컴포넌트 템플릿
import React from 'react';

interface ComponentProps {
  // props 타입 정의
}

const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 로직
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### CSS/Tailwind
- **Tailwind CSS**: 모든 스타일링은 Tailwind 유틸리티 클래스 사용
- **클래스 순서**: Tailwind CSS IntelliSense 플러그인의 자동 정렬 사용
- **커스텀 스타일**: 최소화하며, 필요시 `index.css`에 추가

### 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `StudentManager.tsx`)
- **유틸리티/핸들러**: camelCase (예: `fileHandler.ts`)
- **타입 정의**: kebab-case (예: `student-types.ts`)
- **상수**: UPPER_SNAKE_CASE

## 아키텍처 가이드

### 폴더 구조 원칙
```
src/
├── common/           # 공통 모듈 (재사용 가능)
│   ├── store/       # 전역 상태
│   ├── types/       # 타입 정의
│   └── utils/       # 유틸리티 함수
├── page/            # 페이지별 컴포넌트
│   └── [페이지명]/  # 각 페이지는 독립적 폴더
└── components/      # 재사용 가능한 UI 컴포넌트 (필요시 추가)
```

### 의존성 규칙
- **상위 → 하위**: 가능 (page → common)
- **하위 → 상위**: 금지 (common → page)
- **같은 레벨**: 주의해서 사용

## 새로운 기능 추가하기

### 1. 새로운 페이지 추가
```bash
# 1. 페이지 폴더 생성
mkdir src/page/new-feature

# 2. 컴포넌트 파일 생성
touch src/page/new-feature/NewFeature.tsx
touch src/page/new-feature/index.ts
```

### 2. 새로운 상태 추가
```typescript
// src/common/store/use-new-feature-store.ts
import { create } from 'zustand';

interface NewFeatureState {
  data: any[];
  loading: boolean;
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useNewFeatureStore = create<NewFeatureState>((set) => ({
  data: [],
  loading: false,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
}));
```

### 3. 새로운 IPC 핸들러 추가
```typescript
// electron/handlers/newFeatureHandlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';

export function registerNewFeatureHandlers(): void {
  ipcMain.handle('new-feature:getData', handleGetData);
  ipcMain.handle('new-feature:saveData', handleSaveData);
}

async function handleGetData(event: IpcMainInvokeEvent): Promise<any[]> {
  // 로직 구현
  return [];
}

async function handleSaveData(event: IpcMainInvokeEvent, data: any): Promise<void> {
  // 로직 구현
}
```

```typescript
// electron/ipcHandlers.ts에 추가
import { registerNewFeatureHandlers } from './handlers/newFeatureHandlers';

export function registerAllHandlers(): void {
  // 기존 핸들러들...
  registerNewFeatureHandlers();
}
```

## 상태 관리

### Zustand 스토어 패턴
```typescript
import { create } from 'zustand';

interface StoreState {
  // 상태 정의
  data: DataType[];
  loading: boolean;
  error: string | null;
  
  // 액션 정의
  fetchData: () => Promise<void>;
  updateData: (id: string, updates: Partial<DataType>) => void;
  clearError: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // 초기 상태
  data: [],
  loading: false,
  error: null,
  
  // 액션 구현
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await window.electronAPI.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateData: (id, updates) => {
    set((state) => ({
      data: state.data.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },
  
  clearError: () => set({ error: null }),
}));
```

### 상태 사용 패턴
```typescript
const MyComponent: React.FC = () => {
  const { data, loading, error, fetchData, clearError } = useStore();
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## IPC 통신

### 프리로드 스크립트 패턴
```typescript
// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 데이터 관련
  getData: () => ipcRenderer.invoke('feature:getData'),
  saveData: (data) => ipcRenderer.invoke('feature:saveData', data),
  
  // 파일 관련
  selectFile: (options) => ipcRenderer.invoke('dialog:selectFile', options),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
});
```

### 렌더러에서 사용
```typescript
// src/common/types/electron.d.ts
interface ElectronAPI {
  getData: () => Promise<any[]>;
  saveData: (data: any) => Promise<void>;
  selectFile: (options: any) => Promise<string>;
  readFile: (filePath: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

```typescript
// 컴포넌트에서 사용
const handleLoadData = async () => {
  try {
    const data = await window.electronAPI.getData();
    // 데이터 처리
  } catch (error) {
    console.error('Failed to load data:', error);
  }
};
```

## 파일 처리

### 문서 파일 처리 패턴
```typescript
// HWP 파일 처리
import { parseHwp } from '../utils/hwpParser';

const processHwpFile = async (filePath: string) => {
  try {
    const content = await parseHwp(filePath);
    return content;
  } catch (error) {
    throw new Error(`HWP 파일 처리 실패: ${error.message}`);
  }
};

// DOCX 파일 처리
import mammoth from 'mammoth';

const processDocxFile = async (filePath: string) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX 파일 처리 실패: ${error.message}`);
  }
};
```

### 파일 업로드 컴포넌트 패턴
```typescript
const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  
  const handleFileSelect = async () => {
    try {
      const filePath = await window.electronAPI.selectFile({
        filters: [
          { name: 'Documents', extensions: ['hwp', 'docx', 'pdf'] }
        ]
      });
      
      if (filePath) {
        setProcessing(true);
        const content = await window.electronAPI.readFile(filePath);
        // 파일 내용 처리
        setProcessing(false);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setProcessing(false);
    }
  };
  
  return (
    <div>
      <button onClick={handleFileSelect} disabled={processing}>
        {processing ? 'Processing...' : 'Select File'}
      </button>
    </div>
  );
};
```

## 빌드 및 배포

### 개발 빌드
```bash
# Electron 빌드
npm run build-electron

# 웹 앱 빌드
vite build

# 전체 빌드
npm run build
```

### 프로덕션 빌드
```bash
# 프로덕션 환경으로 빌드
npm run build

# Electron 앱 패키징
npm run electron:build
```

### 빌드 확인사항
- [ ] TypeScript 컴파일 오류 없음
- [ ] ESLint 규칙 준수
- [ ] 모든 의존성 설치됨
- [ ] 환경 변수 설정 확인
- [ ] 파일 경로 정확성 확인

## 문제 해결

### 자주 발생하는 문제들

#### 1. Electron이 시작되지 않는 경우
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# Electron 캐시 삭제
npm run build-electron
```

#### 2. IPC 통신 오류
- 프리로드 스크립트가 올바르게 로드되었는지 확인
- contextBridge 설정 확인
- 핸들러 등록 여부 확인

#### 3. 파일 경로 문제
- Windows 경로 구분자 문제: `path.join()` 사용
- 상대 경로 vs 절대 경로 확인
- 리소스 파일 위치 확인

#### 4. TypeScript 오류
```bash
# 타입 체크
npx tsc --noEmit

# 타입 정의 파일 확인
```

### 디버깅 도구
- **React DevTools**: 렌더러 프로세스 디버깅
- **Electron DevTools**: F12로 접근
- **VSCode Debugger**: 메인 프로세스 디버깅 설정

### 로그 확인
```typescript
// 렌더러 프로세스
console.log('Renderer log:', data);

// 메인 프로세스
console.log('Main process log:', data);

// 파일 로그 (필요시)
import fs from 'fs';
fs.appendFileSync('debug.log', `${new Date()}: ${message}\n`);
```

## 코드 리뷰 체크리스트

### 기본 사항
- [ ] TypeScript 타입 정의가 정확한가?
- [ ] 에러 처리가 적절한가?
- [ ] 메모리 누수 가능성은 없는가?
- [ ] 성능상 문제는 없는가?

### React 관련
- [ ] useEffect 의존성 배열이 올바른가?
- [ ] 불필요한 리렌더링은 없는가?
- [ ] Key prop이 적절한가?

### Electron 관련
- [ ] IPC 통신이 필요한 부분만 사용했는가?
- [ ] 보안상 문제는 없는가? (nodeIntegration 등)
- [ ] 파일 시스템 접근이 안전한가?

이 개발 가이드를 참고하여 일관성 있고 품질 높은 코드를 작성하시기 바랍니다.
