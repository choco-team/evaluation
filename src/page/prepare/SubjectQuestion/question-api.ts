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
  apiBaseUrl: string,
  examData: { questionDetail: any; studentList: any }
) => {
  const response = await fetch(`${apiBaseUrl}/evaluation/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title:examData.questionDetail.title,
      answerSheet: examData.questionDetail.answerSheet,
      studentList: examData.studentList,
    }),
  });

  if (!response.ok) {
    throw new Error('서버에 세션 등록 실패');
  }

  const { sessionKey } = await response.json();
  return sessionKey;
};
