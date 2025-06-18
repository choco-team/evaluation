// 프롬프트 템플릿 관련 타입 정의

export interface PromptTemplate {
  content: string;
}

export interface PromptTemplateResponse {
  success: boolean;
  data?: PromptTemplate;
  error?: string;
}

export interface PromptTemplateOperationResponse {
  success: boolean;
  error?: string;
}

export interface PromptTemplatePreviewResponse {
  success: boolean;
  data?: string;
  error?: string;
}
