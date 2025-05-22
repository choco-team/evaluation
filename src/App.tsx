import React, { useEffect } from 'react';

import Prepare from './page/prepare/prepare';
import { usePageStore } from './common/store/use-page-store';
import WritingPage from './page/upload/WrittingPage';
import { QrCode } from './page/qrcode/QrCode';
import { useElectron } from './common/useElectron';
import { initStudentStore, useStudentStore } from './common/store/studentsStore'; // zustand 초기화

export default function App() {
  const { currentPage } = usePageStore();
  const electron = useElectron(); // ✅ 중복 제거

  // ✅ Hook은 항상 컴포넌트 최상단에서 호출되어야 함
  useEffect(() => {
    initStudentStore(electron); // 리스너 초기화

    // ✅ loadStudents 직접 호출
    useStudentStore.getState().loadStudents();
  }, []);

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
