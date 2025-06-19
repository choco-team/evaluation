
import Prepare from './page/prepare/prepare';
import { usePageStore } from './common/store/use-page-store';
import WritingPage from './page/upload/WrittingPage';
import DirectEvaluationPage from './page/upload/DirectEvaluationPage'; // 직접평가 페이지 추가
import DirectEvaluationCreator from './page/upload/DirectEvaluationCreator'; // 직접평가 생성 페이지 추가
import { QrCode } from './page/qrcode/QrCode';
import PromptTemplate from './page/promptTemplate/PromptTemplate';

export default function App() {
  const { currentPage, pageData } = usePageStore();

  const renderPage = () => {
    console.log('✅ currentPage:', currentPage, 'pageData:', pageData);
    switch (currentPage) {
      case 'prepare':
        return <Prepare />;
      case 'WritingPage':
        return <WritingPage />;
      case 'DirectEvaluationCreator': // 직접평가 생성/수정 페이지
        return (
          <DirectEvaluationCreator 
            evaluationId={pageData?.evaluationId}
            title={pageData?.title}
            description={pageData?.description}
            isEditMode={pageData?.isEditMode || false}
          />
        );
      case 'DirectEvaluationPage':
        return (
          <DirectEvaluationPage
            evaluationId={pageData?.evaluationId || ''}
            subject={pageData?.subject || ''}
            title={pageData?.title || ''}
            description={pageData?.description}
          />
        );
      case 'QrCode':
        return <QrCode />;
      case 'promptTemplate':
        return <PromptTemplate />;
      default:
        return <Prepare />;
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  );
}
