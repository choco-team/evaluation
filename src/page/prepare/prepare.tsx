import RegisterStudent from './RegisterStudent/RegisterStudent';
import SubjectManager from './SubjectManager/SubjectManager';

export default function Prepare() {
  
  // 인증 상태에 따라 조건부 렌더링
  return (    <>
    <SubjectManager />
    <RegisterStudent />
  </>
)
}