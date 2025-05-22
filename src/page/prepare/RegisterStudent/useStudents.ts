// useStudents.ts
import { useState, useEffect, useCallback } from 'react';
import { Student } from '../../../common/types/student';
import { useElectron } from '../../../common/useElectron';

export interface SubmitResult {
  success: boolean;
  message: string;
}

export function useStudents(registerListeners = true) {
  const { send, receive, removeListener } = useElectron();
  const [students, setStudents] = useState<Student[]>([
    { name: null, number: null },
  ]);
  const [submitResult, setSubmitResult] = useState<SubmitResult>({
    success: false,
    message: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ✅ 핸들러는 useCallback으로 고정 (함수 외부에서 선언되면 클린업이 잘 됨)
  const handleGetStudentsResponse = useCallback((result: { 
    success: boolean; 
    data?: Student[]; 
    message: string 
  }) => {
    console.log('📥 [렌더러] get-students-response:', result);
    setIsLoading(false);
    if (result.success && result.data) {
      setStudents(result.data);
      setSubmitResult({ success: true, message: '' });
    } else {
      setSubmitResult({ success: false, message: result.message });
    }
  }, []);

  const handleSaveStudentsResponse = useCallback((result: SubmitResult) => {
    console.log('📥 [렌더러] save-students-response:', result);
    setIsLoading(false);
    setSubmitResult(result);
  }, []);

  // ✅ IPC 리스너 등록
  useEffect(() => {
    if (!registerListeners) return;

    console.log('[useStudents] 리스너 등록');
    receive('get-students-response', handleGetStudentsResponse);
    receive('save-students-response', handleSaveStudentsResponse);

    return () => {
      console.log('[useStudents] 리스너 제거');
      removeListener('get-students-response', handleGetStudentsResponse);
      removeListener('save-students-response', handleSaveStudentsResponse);
    };
  }, [registerListeners, handleGetStudentsResponse, handleSaveStudentsResponse]);

  // ✅ 학생 목록 가져오기
  const getStudentList = () => {
    console.log('📤 [렌더러] get-students 요청 전송');
    setIsLoading(true);
    send('get-students', null);
  };

  // ✅ 학생 목록 저장
  const saveStudentList = () => {
    console.log('📤 [렌더러] save-students 요청 전송');
    setIsLoading(true);
    send('save-students', { students });
  };

  // ✅ 학생 추가
  const addStudent = () => {
    const lastStudent = students[students.length - 1];
    const lastNumber = lastStudent.number !== null ? Number(lastStudent.number) : 0;
    const newStudent: Student = {
      name: null,
      number: lastNumber + 1,
    };
    setStudents([...students, newStudent]);
  };

  // ✅ 학생 삭제
  const removeStudent = (index: number) => {
    if (students.length > 1) {
      const updatedStudents = [...students];
      updatedStudents.splice(index, 1);

      setIsLoading(true);
      setStudents(updatedStudents);
      send('save-students', { students: updatedStudents });
    }
  };

  // ✅ 입력값 변경
  const handleInputChange = (index: number, field: keyof Student, value: string) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { 
      ...updatedStudents[index], 
      [field]: field === 'number' ? (value === '' ? null : Number(value)) : value 
    };
    setStudents(updatedStudents);
  };

  // ✅ 엑셀 가져오기
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
