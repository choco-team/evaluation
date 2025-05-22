// question-api.ts

export const fetchExamData = async (
  invoke: (channel: string, data?: any) => Promise<any>,
  id: string,
  subject: string
) => {
  const result = await invoke('get-exam', { id, subject });

  if (!result || !result.questionDetail || !result.studentList) {
    throw new Error('문항 또는 학생 목록을 불러올 수 없습니다.');
  }

  return {
    questionDetail: result.questionDetail,
    studentList: result.studentList,
  };
};

export const registerSessionToServer = async (
  invoke: (channel: string, data?: any) => Promise<any>,
  apiBaseUrl: string,
  examData: { questionDetail: any; studentList: any }
): Promise<string> => {
  const result = await invoke('register-session', {
    apiBaseUrl,
    examData,
  });

  if (!result.success) {
    throw new Error(result.message || '서버에 세션 등록 실패');
  }

  return result.sessionKey; // 🔥 반환값은 sessionKey 하나
};
