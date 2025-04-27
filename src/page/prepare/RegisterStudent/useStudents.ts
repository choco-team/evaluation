// useStudents.ts - 학생 관리 비즈니스 로직 커스텀 훅
import { useState, useEffect } from 'react';
import { Student } from '../../../common/types/student';
import { useElectron } from '../../../common/useElectron';

export interface SubmitResult {
  success: boolean;
  message: string;
}

export function useStudents() {
  const { send, receive, removeListener } = useElectron();
  const [students, setStudents] = useState<Student[]>([
    { name: null, number: null },
  ]);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    success: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 일렉트론 IPC 통신 설정
  useEffect(() => {
    // 학생 목록 응답 처리
    const handleGetStudentsResponse = (result: { 
      success: boolean; 
      data?: Student[]; 
      message: string 
    }) => {
      console.log('응답 도착')
      setIsLoading(false);
      if (result.success && result.data) {
        setStudents(result.data);
        setSubmitResult({ success: true, message: '' });
      } else {
        setSubmitResult({ success: false, message: result.message });
      }
    };

    // 학생 저장 응답 처리
    const handleSaveStudentsResponse = (result: SubmitResult) => {
      setIsLoading(false);
      setSubmitResult(result);
    };

    // 리스너 등록
    receive('get-students-response', handleGetStudentsResponse);
    receive('save-students-response', handleSaveStudentsResponse);

    // 컴포넌트 마운트 시 학생 목록 로드
    getStudentList();

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      removeListener('get-students-response');
      removeListener('save-students-response');
    };
  }, []);

  // 학생 목록 가져오기
  const getStudentList = () => {
    setIsLoading(true);
    send('get-students', null);
  };

  // 학생 목록 저장
  const saveStudentList = () => {
    setIsLoading(true);
    send('save-students', { students });
  };

  // 학생 추가 함수
  const addStudent = () => {
    const lastStudent = students[students.length - 1];
    const lastNumber = lastStudent.number !== null ? Number(lastStudent.number) : 0;
    const newStudent: Student = {
      name: null,
      number: lastNumber + 1,
    };
    setStudents([...students, newStudent]);
  };

  // 학생 삭제 함수
  const removeStudent = (index: number) => {
    if (students.length > 1) {
      // 업데이트할 학생 배열 생성
      const updatedStudents = [...students];
      updatedStudents.splice(index, 1);
      
      setIsLoading(true);
      setStudents(updatedStudents);
      send('save-students', { students: updatedStudents });
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (index: number, field: keyof Student, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { 
      ...updatedStudents[index], 
      [field]: field === 'number' ? (value === '' ? null : Number(value)) : value 
    };
    setStudents(updatedStudents);
  };

  // 엑셀 가져오기 핸들러
  const handleImportedData = (importedStudents: Student[]) => {
    setStudents((prevStudents) => {
      let newStudents;
      if (
        prevStudents.length === 1 &&
        !prevStudents[0].name &&
        !prevStudents[0].number
      ) {
        newStudents = importedStudents;
      } else {
        newStudents = [...prevStudents, ...importedStudents];
      }
      
      // 서버에 반영
      setTimeout(() => {
        setIsLoading(true);
        send('save-students', { students: newStudents });
      }, 0);
      
      return newStudents;
    });
  };

  return {
    students,
    submitResult,
    isLoading,
    addStudent,
    removeStudent,
    handleInputChange,
    handleImportedData,
    saveStudentList,
    getStudentList
  };
}