import React, { ChangeEvent, useState } from 'react';
import { Student, ExcelUploaderProps } from '../../../common/types/student';
import * as XLSX from 'xlsx';

interface ExtendedExcelUploaderProps extends ExcelUploaderProps {
  disabled?: boolean;
}

// 1. 가능한 키들
const nameKeys = ['이름', '성명', '아동명', '학생명', 'name'];
const numberKeys = ['번호', '출석번호', 'number'];


// 2. 키 중 하나를 찾아서 값 반환
function findValue(obj: any, keys: string[]) {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return undefined;
}

const ExcelUploader: React.FC<ExtendedExcelUploaderProps> = ({
  onDataImported,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 엑셀 파일 파싱 및 처리
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];

      const rawData = XLSX.utils.sheet_to_json(sheet);

      const students: Student[] = (rawData as any[]).map((row, index) => {
        const name = findValue(row, nameKeys) ?? '';
        const number = findValue(row, numberKeys);
      
        return {
          name,
          number: number !== undefined && number !== '' ? Number(number) : index + 1
        };
      });
      onDataImported(students)      
    } catch (err) {
      console.error('엑셀 파싱 오류:', err);
      window.electronAPI.showMessageBox('엑셀 파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      event.target.value = ''; // 파일 초기화
    }
  };

  return (
    <div>
      <label
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? '파일 처리 중...' : '엑셀 파일 가져오기'}
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isLoading}
        />
      </label>
    </div>
  );
};

export default ExcelUploader;
