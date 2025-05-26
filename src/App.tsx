
import Prepare from './page/prepare/prepare';
import { usePageStore } from './common/store/use-page-store';
import WritingPage from './page/upload/WrittingPage';
import { QrCode } from './page/qrcode/QrCode';

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
