import { useEffect } from 'react';
import RegisterStudent from './RegisterStudent/RegisterStudent';
import SubjectManager from './SubjectManager/SubjectManager';
import { initStudentStore, useStudentStore } from '../../common/store/studentsStore';
import { useElectron } from '../../common/useElectron';
import { usePageStore } from '../../common/store/use-page-store';

export default function Prepare() {

    const electron = useElectron(); // ✅ 중복 제거
    const { setCurrentPage } = usePageStore();

    // ✅ Hook은 항상 컴포넌트 최상단에서 호출되어야 함
    useEffect(() => {
      initStudentStore(electron); // 리스너 초기화
  
      // ✅ loadStudents 직접 호출
      useStudentStore.getState().loadStudents();
    }, []);
  
  
  // 인증 상태에 따라 조건부 렌더링
  return (
    <>
      {/* 헤더 영역 */}
      <div className="container mx-auto p-4 mb-6">
        <div className="flex items-center justify-end mb-4">
          <button
            type="button"
            onClick={() => setCurrentPage('promptTemplate')}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
            평가 기준 설정
          </button>
        </div>
      </div>

      <SubjectManager />
      <RegisterStudent />
    </>
  )
}