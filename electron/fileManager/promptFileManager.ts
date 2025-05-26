import fs from 'fs';
import path from 'path';
import { PATHS } from '../pathManager.js';
import { shell } from 'electron';


export function createPromptText(subject: string, number: number, text: string) {
  const subjectDir = path.join(PATHS.prompts); // 프롬프트파일
  const promptFile = path.join(subjectDir, `${subject}-${number}번학생.txt`); // 학생별 파일

    // 1. 과목 디렉토리가 없다면 생성
    if (!fs.existsSync(subjectDir)) {
      fs.mkdirSync(subjectDir, { recursive: true });
    }
    fs.writeFileSync(promptFile, text); // 프롬프트 텍스트 파일 생성
}

export async function openFolder(folderPath?: string) {
  const targetPath = folderPath ?? PATHS.prompts; // 기본값은 내부에서 처리
  const result = await shell.openPath(targetPath);

  if (result) {
    console.error('❌ 폴더 열기 실패:', result);
    return false;
  }
  return true;
}
