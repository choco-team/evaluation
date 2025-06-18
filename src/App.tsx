
import Prepare from './page/prepare/prepare';
import { usePageStore } from './common/store/use-page-store';
import WritingPage from './page/upload/WrittingPage';
import { QrCode } from './page/qrcode/QrCode';
import PromptTemplate from './page/promptTemplate/PromptTemplate';

export default function App() {
  const { currentPage } = usePageStore();


  const renderPage = () => {
    console.log('✅ currentPage:', currentPage);
    switch (currentPage) {
      case 'prepare':
        return <Prepare />;
      case 'WritingPage':
        return <WritingPage />;
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
