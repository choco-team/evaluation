import { ipcMain } from 'electron';
import { 
  loadTemplate, 
  saveTemplate, 
  createDefaultTemplate, 
  openTemplateFolder 
} from '../fileManager/promptFileManager.js';

export function registerPromptTemplateHandlers() {
  
  /**
   * 현재 템플릿 로드
   */
  ipcMain.on('load-prompt-template', (event) => {
    try {
      console.log('프롬프트 템플릿 로드 요청');
      const template = loadTemplate();
      console.log('✅ 템플릿 로드 성공');
      event.sender.send('load-prompt-template-response', {
        success: true,
        data: template,
        message: '템플릿을 성공적으로 로드했습니다.'
      });
    } catch (error) {
      console.error('❌ 템플릿 로드 실패:', error);
      event.sender.send('load-prompt-template-response', {
        success: false,
        message: '템플릿 로드 중 오류가 발생했습니다.'
      });
    }
  });

  /**
   * 템플릿 저장
   */
  ipcMain.on('save-prompt-template', (event, payload) => {
    try {
      console.log('프롬프트 템플릿 저장 요청:', payload);
      
      const { content } = payload;
      
      // 유효성 검사
      if (!content || typeof content !== 'string') {
        event.sender.send('save-prompt-template-response', {
          success: false,
          message: '템플릿 내용이 유효하지 않습니다.'
        });
        return;
      }
      
      const template = { content };
      const result = saveTemplate(template);
      
      if (result) {
        console.log('✅ 템플릿 저장 성공');
        event.sender.send('save-prompt-template-response', {
          success: true,
          message: '템플릿이 성공적으로 저장되었습니다.'
        });
      } else {
        event.sender.send('save-prompt-template-response', {
          success: false,
          message: '템플릿 저장에 실패했습니다.'
        });
      }
    } catch (error) {
      console.error('❌ 템플릿 저장 실패:', error);
      event.sender.send('save-prompt-template-response', {
        success: false,
        message: '템플릿 저장 중 오류가 발생했습니다.'
      });
    }
  });

  /**
   * 기본 템플릿으로 초기화
   */
  ipcMain.on('reset-prompt-template', (event) => {
    try {
      console.log('프롬프트 템플릿 초기화 요청');
      const defaultTemplate = createDefaultTemplate();
      const result = saveTemplate(defaultTemplate);
      
      if (result) {
        console.log('✅ 템플릿 초기화 성공');
        event.sender.send('reset-prompt-template-response', {
          success: true,
          data: defaultTemplate,
          message: '템플릿이 기본값으로 초기화되었습니다.'
        });
      } else {
        event.sender.send('reset-prompt-template-response', {
          success: false,
          message: '템플릿 초기화에 실패했습니다.'
        });
      }
    } catch (error) {
      console.error('❌ 템플릿 초기화 실패:', error);
      event.sender.send('reset-prompt-template-response', {
        success: false,
        message: '템플릿 초기화 중 오류가 발생했습니다.'
      });
    }
  });

  /**
   * 템플릿 폴더 열기
   */
  ipcMain.on('open-template-folder', (event) => {
    try {
      console.log('템플릿 폴더 열기 요청');
      openTemplateFolder().then((result) => {
        if (result) {
          console.log('✅ 템플릿 폴더 열기 성공');
          event.sender.send('open-template-folder-response', {
            success: true,
            message: '템플릿 폴더를 열었습니다.'
          });
        } else {
          event.sender.send('open-template-folder-response', {
            success: false,
            message: '템플릿 폴더 열기에 실패했습니다.'
          });
        }
      }).catch((error) => {
        console.error('❌ 템플릿 폴더 열기 실패:', error);
        event.sender.send('open-template-folder-response', {
          success: false,
          message: '템플릿 폴더 열기 중 오류가 발생했습니다.'
        });
      });
    } catch (error) {
      console.error('❌ 템플릿 폴더 열기 실패:', error);
      event.sender.send('open-template-folder-response', {
        success: false,
        message: '템플릿 폴더 열기 중 오류가 발생했습니다.'
      });
    }
  });

  console.log('📋 프롬프트 템플릿 핸들러 등록 완료');
}
