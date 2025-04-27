import { app } from 'electron';
import fs from 'fs';
import path from 'path';

// 루트 디렉토리: "문서/티처캔평가간소화"
export const BASE_DIR = path.join(app.getPath('documents'), '티처캔평가간소화');

// 서브 폴더 경로 모음
export const PATHS = {
  prompts: path.join(BASE_DIR, '프롬프트'),
  exam: path.join(BASE_DIR, '평가지'),
  answer: path.join(BASE_DIR, '답안지'),
};

// 경로가 디렉토리일 경우 존재하지 않으면 생성
function ensureDirectories() {
  for (const key in PATHS) {
    const p = PATHS[key as keyof typeof PATHS];
    if (path.extname(p) === '' && !fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  }
}

// 앱 시작 시 한 번만 실행되면 됨
ensureDirectories();
