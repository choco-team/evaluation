// types/student.ts
export interface Student {
    name: string | null;
    number: number | null;
  }
  
  export interface ExcelUploaderProps {
    onDataImported: (students: Student[]) => void;
  }