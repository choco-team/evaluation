// DirectEvaluationCreator.tsx - 직접평가 항목 생성 컴포넌트 (QuestionInfo 스타일로 수정)
import React, { useState, useEffect } from 'react';
import { usePageStore } from '../../common/store/use-page-store';
import { useElectron } from '../../common/useElectron';
import SubjectSelector from './SubjectSelector';
import TitleInput from './TitleInput';
import ContentTextarea from './ContentTextarea';
import SubmitButton from './SubmitButton';
import StatusMessage from './StatusMessage';

interface DirectEvaluationCreatorProps {
  evaluationId?: string; // 수정 모드용
  title?: string; // 수정 모드용
  description?: string; // 수정 모드용
  isEditMode?: boolean; // 수정 모드 플래그
}

interface Subject {
  uuid: string;
  name: string;
}

const DirectEvaluationCreator: React.FC<DirectEvaluationCreatorProps> = ({ 
  evaluationId,
  title: initialTitle = '',
  description: initialDescription = '',
  isEditMode = false
}) => {
  const { setCurrentPage } = usePageStore();
  const { send, receive, removeListener } = useElectron();
  
  // 폼 상태
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState({ success: false, message: '' });

  // 과목 목록 로드
  useEffect(() => {
    const loadSubjects = () => {
      setIsLoading(true);
      send('get-subjects', null);
    };

    const handleSubjectsResponse = (result: any) => {
      setIsLoading(false);
      if (result.success && result.data) {
        const subjectList = result.data.map((name: string, index: number) => ({
          uuid: `subject-${index}`,
          name: name
        }));
        setSubjects(subjectList);
      } else {
        setSubmitResult({ success: false, message: '과목 목록을 불러오는데 실패했습니다.' });
      }
    };

    receive('get-subjects-response', handleSubjectsResponse);
    loadSubjects();

    return () => {
      removeListener('get-subjects-response', handleSubjectsResponse);
    };
  }, [send, receive, removeListener]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEditMode && evaluationId) {
      // pageData에서 과목 정보 가져오기
      const { pageData } = usePageStore.getState();
      if (pageData?.subject) {
        setSelectedSubject(pageData.subject);
      }
      
      const loadEvaluationData = async () => {
        setIsLoading(true);
        try {
          // 수정 모드에서는 백엔드에서 해당 평가의 과목 정보도 가져와야 함
          // 임시로 pageData에서 받은 정보 사용
          setIsLoading(false);
        } catch (error) {
          console.error('평가 데이터 로드 실패:', error);
          setIsLoading(false);
        }
      };
      loadEvaluationData();
    }
  }, [isEditMode, evaluationId]);

  // 이벤트 핸들러들
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  // 폼 제출 로직을 별도 함수로 분리 (SubmitButton용)
  const submitEvaluationData = () => {
    if (!selectedSubject.trim()) {
      setSubmitResult({ success: false, message: '과목을 선택해주세요.' });
      return;
    }

    if (!title.trim()) {
      setSubmitResult({ success: false, message: '평가 제목을 입력해주세요.' });
      return;
    }

    setIsLoading(true);
    
    const evaluationData: any = {
      id: isEditMode ? evaluationId : undefined,
      title: title.trim(),
      comment: description.trim(),
      subject: selectedSubject,
      evaluationType: 'direct',
      content: '',
      answerSheet: [],
      correctAnswer: [],
    };
    
    if (!isEditMode) {
      evaluationData.createdAt = new Date().toISOString();
    }
    
    console.log('[DirectEvaluationCreator] 저장 데이터:', evaluationData);
    send('save-question', evaluationData);
  };

  // 폼 제출 이벤트 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEvaluationData();
  };

  // IPC 응답 처리
  useEffect(() => {
    const handleSaveResponse = (result: { success: boolean; message: string }) => {
      setIsLoading(false);
      setSubmitResult(result);
      
      if (result.success) {
        console.log('[DirectEvaluationCreator] 저장 성공:', result.message);
        setTimeout(() => {
          setCurrentPage('prepare');
        }, 1500);
      }
    };

    receive('save-question-response', handleSaveResponse);

    return () => {
      removeListener('save-question-response', handleSaveResponse);
    };
  }, [receive, removeListener, setCurrentPage]);

  // 취소 버튼
  const handleCancel = () => {
    setCurrentPage('prepare');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        직접평가 항목 {isEditMode ? '수정' : '작성'}하기
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 과목 선택 */}
        <SubjectSelector
          subjects={subjects}
          selectedSubject={selectedSubject}
          onChange={handleSubjectChange}
          isLoading={isLoading}
        />

        {/* 평가 제목 */}
        <TitleInput
          value={title}
          onChange={handleTitleChange}
          isLoading={isLoading}
        />

        {/* 평가 설명 */}
        <ContentTextarea
          id="description"
          label="평가 설명 (선택사항)"
          placeholder="평가의 목적, 기준, 범위 등을 구체적으로 설명해주세요.&#10;예: 수학 개념을 활용한 발표 능력과 질문 답변 능력을 평가합니다."
          value={description}
          onChange={handleDescriptionChange}
          minHeight="120px"
          isLoading={isLoading}
        />

        {/* 안내 메시지 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">직접평가 항목 {isEditMode ? '수정' : '생성'} 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 실기, 발표, 참여도 등 교사가 직접 관찰하여 평가하는 항목입니다</li>
                <li>• {isEditMode ? '수정 후' : '생성 후'} 평가항목 목록에서 "평가 입력" 버튼으로 학생별 결과를 기록할 수 있습니다</li>
                <li>• 평가 설명은 선택사항이며, 평가 기준이나 방법을 명시하면 도움이 됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-70"
          >
            취소하기
          </button>
          <SubmitButton 
            onClick={submitEvaluationData}
            text={isEditMode ? '평가항목 수정' : '평가항목 등록'}
            isLoading={isLoading}
          />
        </div>

        {/* 상태 메시지 */}
        <StatusMessage result={submitResult} />
      </form>
    </div>
  );
};

export default DirectEvaluationCreator;