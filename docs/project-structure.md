# 티처캔 평가 간소화 앱 - 프로젝트 구조

## 프로젝트 개요

**프로젝트명**: 티처캔 평가 간소화 앱 (teachercan_evaluation)  
**기술 스택**: Electron + React + TypeScript + Vite  
**설명**: 교육 현장에서 학생 답안을 효율적으로 평가하고 관리하는 데스크톱 애플리케이션

## 전체 디렉토리 구조

```
local/
├── docs/                    # 프로젝트 문서화 폴더
├── src/                     # 프론트엔드 소스 코드
│   ├── common/             # 공통 모듈
│   │   ├── store/          # 상태 관리
│   │   ├── types/          # TypeScript 타입 정의
│   │   └── utils/          # 유틸리티 함수
│   ├── page/               # 페이지별 컴포넌트
│   │   ├── prepare/        # 평가 준비 페이지
│   │   ├── promptTemplate/ # 프롬프트 템플릿 관리
│   │   ├── qrcode/         # QR 코드 생성
│   │   └── upload/         # 파일 업로드
│   ├── App.tsx             # 메인 App 컴포넌트
│   ├── main.tsx            # React 앱 진입점
│   └── index.css           # 전역 스타일
├── electron/               # Electron 메인 프로세스
│   ├── assets/             # 앱 아이콘 등 자산
│   ├── fileManager/        # 파일 관리
│   ├── handlers/           # IPC 핸들러
│   ├── sseManager/         # SSE 관리
│   ├── types/              # Electron 타입 정의
│   ├── utils/              # Electron 유틸리티
│   ├── main.ts             # Electron 메인 프로세스
│   ├── preload.js          # 프리로드 스크립트
│   └── windowManager.ts    # 윈도우 관리
├── dist/                   # 빌드된 웹 파일
├── dist-electron/          # 빌드된 Electron 파일
├── release/                # 배포용 빌드 파일
├── node_modules/           # 의존성 패키지
├── package.json            # 프로젝트 설정 및 의존성
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
└── .env*                   # 환경 변수
```

## 주요 기능별 구조

### 1. 상태 관리 (src/common/store/)
- **studentsStore.ts**: 학생 정보 관리
- **use-answer-sheet-store.ts**: 답안지 상태 관리
- **use-page-store.ts**: 페이지 상태 관리

### 2. 데이터 타입 (src/common/types/)
- **answer-sheet-types.ts**: 답안지 관련 타입
- **prompt-template-types.ts**: 프롬프트 템플릿 타입
- **question-types.ts**: 문제 관련 타입
- **student.ts**: 학생 정보 타입
- **electron.d.ts**: Electron API 타입 정의

### 3. 페이지 컴포넌트 (src/page/)
- **prepare/**: 평가 준비 관련 페이지
  - 학생 등록 (RegisterStudent)
  - 과목 관리 (SubjectManager)
  - 문제 관리 (SubjectQuestion)
- **promptTemplate/**: AI 평가용 프롬프트 템플릿 관리
- **qrcode/**: QR 코드 생성 기능
- **upload/**: 파일 업로드 기능

### 4. Electron 핸들러 (electron/handlers/)
- **answerDataHandler.ts**: 답안 데이터 처리
- **directEvaluationHandlers.ts**: 직접 평가 처리
- **documentHandlers.ts**: 문서 파일 처리
- **promptCreatingHandlers.ts**: 프롬프트 생성
- **promptTemplateHandlers.ts**: 프롬프트 템플릿 관리
- **questionHandlers.ts**: 문제 관리
- **sessionHandler.ts**: 세션 관리
- **sseHandler.ts**: SSE 통신 처리
- **studentHandlers.ts**: 학생 정보 처리
- **subjectHandlers.ts**: 과목 정보 처리

## 주요 기술 특징

### Frontend
- **React 19**: 최신 React 버전 사용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Zustand**: 가벼운 상태 관리

### Backend (Electron)
- **Electron**: 크로스 플랫폼 데스크톱 앱
- **TypeScript**: 메인 프로세스도 TypeScript로 작성
- **IPC 통신**: 렌더러-메인 프로세스 간 통신
- **SSE**: Server-Sent Events를 통한 실시간 통신

### 파일 처리
- **HWP**: 한글 파일 처리 (node-hwp)
- **DOCX**: MS Word 파일 처리 (mammoth)
- **XLSX**: Excel 파일 처리
- **PDF**: PDF 문서 처리

## 개발 환경 설정

### 필수 요구사항
- Node.js (최신 LTS 버전)
- npm 또는 yarn
- Git

### 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# Electron 빌드
npm run electron:build
```

## 배포 설정
- **Target**: Windows Portable 실행 파일
- **Output**: release/ 폴더에 생성
- **Compression**: 최대 압축 설정

## 환경 변수
- **.env.development**: 개발 환경 설정
- **.env.production**: 프로덕션 환경 설정

이 구조 문서는 프로젝트의 전체적인 구조를 이해하는 데 도움이 되며, 각 모듈의 역할과 의존성을 파악할 수 있습니다.
