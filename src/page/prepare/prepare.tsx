import { useEffect } from 'react';
import RegisterStudent from './RegisterStudent/RegisterStudent';
import SubjectManager from './SubjectManager/SubjectManager';
import { initStudentStore, useStudentStore } from '../../common/store/studentsStore';
import { useElectron } from '../../common/useElectron';

export default function Prepare() {

    const electron = useElectron(); // ✅ 중복 제거

    // ✅ Hook은 항상 컴포넌트 최상단에서 호출되어야 함
    useEffect(() => {
      initStudentStore(electron); // 리스너 초기화
  
      // ✅ loadStudents 직접 호출
      useStudentStore.getState().loadStudents();
    }, []);
  
  
  // 인증 상태에 따라 조건부 렌더링
  return (    <>
    <SubjectManager />
    <RegisterStudent />
  </>
)
}