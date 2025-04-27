import React from 'react';

import Prepare from './page/prepare/prepare';
import { usePageStore } from './common/store/use-page-store';
import WritingPage from './page/upload/WrittingPage';

export default function App() {
  const { currentPage } = usePageStore();

  // 현재 페이지 상태에 따라 다른 컴포넌트 렌더링
  const renderPage = () => {
    console.log('✅ currentPage:', currentPage);
    switch (currentPage) {
      case 'prepare':
        return <><Prepare /></>;
      case 'WritingPage':
        return <WritingPage />;
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