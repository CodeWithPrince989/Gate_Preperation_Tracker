export type ExamType = 'CSE' | 'DA' | 'BOTH';
export type TopicType = 'Theory' | 'Numerical' | 'Programming' | 'Mixed';
export type LearningSource = 'Lecture' | 'Book' | 'Notes' | 'Other';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type MasteryStatus = 'Learning' | 'Revising' | 'Mastered';
export type SessionStatus = 'PENDING' | 'COMPLETED' | 'RESCHEDULED';
export type ErrorCategory = 'Conceptual' | 'Calculation' | 'Misread Question' | 'Formula Recall' | 'Time Management' | 'None';
export type QuestionResult = 'CORRECT' | 'INCORRECT' | 'SKIPPED' | 'PARTIAL';

export interface Topic {
  id: string;
  name: string;
  subjectName: string;
  exam: ExamType;
  firstStudiedAt: string; // ISO date 'YYYY-MM-DD'
  topicType: TopicType;
  learningSource: LearningSource;
  initialConfidence: ConfidenceLevel;
  estimatedDifficulty: DifficultyLevel;
  masteryStatus: MasteryStatus;
  notes: string;
  resourceUrl: string;
  checklist: { id: string; text: string; done: boolean }[];
  createdAt: string;
}

export interface RevisionSession {
  id: string;
  topicId: string;
  sequenceNumber: number; // 1 to 7+
  scheduledDate: string; // 'YYYY-MM-DD'
  completedAt?: string | null;
  status: SessionStatus;
  durationMinutes: number;
  recallRating?: 1 | 2 | 3 | 4 | null;
  questionsAttempted: number;
  questionsCorrect: number;
  mistakesSummary?: string;
  retrievalNotes?: string;
}

export interface PracticeLog {
  id: string;
  topicId?: string;
  subjectName: string;
  exam: 'CSE' | 'DA';
  gateYear: number;
  questionRef: string;
  marks: number;
  result: QuestionResult;
  timeTakenSeconds: number;
  errorCategory: ErrorCategory;
  explanation: string;
  solvedIndependently: boolean;
  createdAt: string;
}

export interface StudyActivity {
  id: string;
  activityDate: string; // 'YYYY-MM-DD'
  activityType: 'REVISION' | 'PYQ' | 'NEW_TOPIC' | 'MOCK';
  durationMinutes: number;
  referenceId?: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  exam: ExamType;
  isCustom?: boolean;
}
