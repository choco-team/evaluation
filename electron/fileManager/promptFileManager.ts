import fs from 'fs';
import path from 'path';
import { PATHS } from '../pathManager.js';
import { shell } from 'electron';

// 기본 프롬프트 템플릿
const DEFAULT_TEMPLATE = `지금부터 너는 교과 평가문을 작성해야하는 학교 교사야
이 학생의 교과 학습 발달 상황을 작성해줘!
너가 할 일은 평가지와 학생의 답안을 보고 학생에 대해 평가글을 작성하는 것이야
예를 들어 수학 문제에서 3+5를 맞춘 학생이면 '받아올림이 없는 한자리수의 덧셈 계산을 정확히 수행함',
사회 문제에서 지방자치단체장에 관한 문제를 맞추면 '우리나라의 지방자치단체장의 역할을 정확히 말함.' 등을 적어서 학생에 대한 교과학습 발달상황을 작성하는 것이야
각 문항별 답안은 배열로 제공될 것이고 배열 순서대로 문항에 대한 답을 적었다고 생각하면 돼
평가는 150자 내외로 작성해줘
배열로 주어진 학생의 답안을 기반으로 교과 학습 발달 상황을 작성할 것
제시된 문항에 관한 정보는 담지 말고 학생의 학습 발달 상황에만 초점을 두고 작성할 것
모든 문장은 "~함", "~임"으로 끝나도록 작성할 것
평가문과 관련 없는 내용은 일절 하지 말 것`;

// 템플릿 타입 정의
interface PromptTemplate {
  content: string;
}


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

// 템플릿 관련 함수들

/**
 * 기본 템플릿 파일 경로 반환
 */
function getTemplateFilePath(): string {
  return path.join(PATHS.templates, 'default_template.json');
}

/**
 * 기본 템플릿 생성
 */
export function createDefaultTemplate(): PromptTemplate {
  return {
    content: DEFAULT_TEMPLATE
  };
}

/**
 * 템플릿 저장
 */
export function saveTemplate(template: PromptTemplate): boolean {
  try {
    const templatePath = getTemplateFilePath();
    const templateDir = path.dirname(templatePath);
    
    // 템플릿 디렉토리가 없다면 생성
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }
    
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2), 'utf8');
    console.log('✅ 템플릿 저장 완료:', templatePath);
    return true;
  } catch (error) {
    console.error('❌ 템플릿 저장 실패:', error);
    return false;
  }
}

/**
 * 템플릿 로드
 */
export function loadTemplate(): PromptTemplate {
  try {
    const templatePath = getTemplateFilePath();
    
    // 템플릿 파일이 없다면 기본 템플릿 생성 후 저장
    if (!fs.existsSync(templatePath)) {
      const defaultTemplate = createDefaultTemplate();
      saveTemplate(defaultTemplate);
      return defaultTemplate;
    }
    
    const templateData = fs.readFileSync(templatePath, 'utf8');
    const template: PromptTemplate = JSON.parse(templateData);
    
    // 템플릿 유효성 검사
    if (!template.content) {
      console.warn('⚠️ 템플릿 파일이 손상되었습니다. 기본 템플릿을 사용합니다.');
      return createDefaultTemplate();
    }
    
    return template;
  } catch (error) {
    console.error('❌ 템플릿 로드 실패:', error);
    return createDefaultTemplate();
  }
}

/**
 * 템플릿 폴더 열기
 */
export async function openTemplateFolder(): Promise<boolean> {
  return await openFolder(PATHS.templates);
}
