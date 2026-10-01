export type Id = string;
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'JUDGE';
export type PracticeType = 'ORDER' | 'RANDOM' | 'SPECIAL' | 'WRONG' | 'FAVORITE';
export type SessionStatus = 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
export type MasteryStatus = 'UNMASTERED' | 'MASTERED';
export type WordQueueMode = 'NEW' | 'REVIEW' | 'FAVORITE';
export type WordRating = 0 | 1 | 2 | 3;
export type StatisticsPeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'TOTAL';
export type QuestionBankKind = 'CIVIL_REAL' | 'OTHER';

export interface UserProfile {
  id: Id;
  nickname: string;
  avatarUrl: string;
  registeredAt: string;
}

export interface UserSettings {
  dailyWordTarget: number;
  dailyQuestionTarget: number;
  dailyStudyMinutes: number;
  autoNextQuestion: boolean;
  showAnalysisAfterAnswer: boolean;
}

export interface ExamCategory {
  id: Id;
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  theme: string;
}

export interface Subject {
  id: Id;
  examId: Id;
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface Chapter {
  id: Id;
  subjectId: Id;
  parentId?: Id;
  name: string;
  description: string;
  sort: number;
}

export interface KnowledgePoint {
  id: Id;
  chapterId: Id;
  parentId?: Id;
  name: string;
  description: string;
}

export interface QuestionMaterial {
  id: Id;
  subjectId: Id;
  title: string;
  content: string;
  source: string;
  year: number;
}

export interface QuestionOption {
  key: string;
  content: string;
}

export interface Question {
  id: Id;
  subjectId: Id;
  chapterId: Id;
  knowledgePointIds: Id[];
  materialId?: Id;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  difficulty: number;
  source: string;
  year: number;
  sort: number;
  bankId?: Id;
  bankKind?: QuestionBankKind;
}

export interface AnswerKey {
  questionId: Id;
  correctKeys: string[];
  analysis: string;
}

export interface ImportedQuestionBank {
  id: Id;
  title: string;
  kind: QuestionBankKind;
  source: string;
  year: number;
  fileName: string;
  importedAt: string;
  subjectIds: Id[];
  questionIds: Id[];
  questions: Question[];
  materials: QuestionMaterial[];
  answerKeys: AnswerKey[];
}

export interface PracticeQuestionVO extends Question {
  typeLabel: string;
  originLabel: string;
  material?: QuestionMaterial;
  knowledgePoints: KnowledgePoint[];
  favorite: boolean;
}

export interface PracticeConfig {
  practiceType: PracticeType;
  examId?: Id;
  subjectId?: Id;
  chapterIds: Id[];
  knowledgePointIds: Id[];
  difficulty: number[];
  count: number;
  questionBankId?: Id;
}

export interface AnswerResult {
  correct: boolean;
  userKeys: string[];
  correctKeys: string[];
  analysis: string;
  knowledgePoints: string[];
  userAnswerText?: string;
  correctAnswerText?: string;
}

export interface SessionAnswer {
  questionId: Id;
  userKeys: string[];
  durationSeconds: number;
  answeredAt: string;
  result: AnswerResult;
}

export interface PracticeSession {
  id: Id;
  userId: Id;
  config: PracticeConfig;
  questionIds: Id[];
  currentIndex: number;
  answers: Record<Id, SessionAnswer>;
  status: SessionStatus;
  startedAt: string;
  lastActiveAt: string;
  finishedAt?: string;
}

export interface AnswerRecord {
  id: Id;
  sessionId: Id;
  questionId: Id;
  subjectId: Id;
  knowledgePointIds: Id[];
  userKeys: string[];
  correctKeys: string[];
  correct: boolean;
  durationSeconds: number;
  answeredAt: string;
}

export interface WrongQuestionRecord {
  questionId: Id;
  wrongCount: number;
  lastWrongAnswer: string[];
  masteryStatus: MasteryStatus;
  correctStreak: number;
  firstWrongAt: string;
  lastWrongAt: string;
  masteredAt?: string;
}

export interface WordBook {
  id: Id;
  code: string;
  name: string;
  description: string;
  accent: string;
  wordIds: Id[];
}

export interface WordItem {
  id: Id;
  spelling: string;
  ukPhonetic: string;
  usPhonetic: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  difficulty: number;
}

export interface WordLearningState {
  wordId: Id;
  masteryLevel: WordRating;
  studyCount: number;
  correctCount: number;
  wrongCount: number;
  lastRating: WordRating;
  firstStudyAt: string;
  lastStudyAt: string;
  nextReviewAt: string;
}

export interface WordLearningLog {
  id: Id;
  wordId: Id;
  wordBookId: Id;
  actionType: WordQueueMode;
  rating: WordRating;
  durationSeconds: number;
  learnedAt: string;
  nextReviewAt: string;
}

export interface DailyStudy {
  date: string;
  studyDurationSeconds: number;
  newWordCount: number;
  reviewWordCount: number;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  finishedSessionCount: number;
}

export interface AppState {
  version: number;
  user: UserProfile | null;
  settings: UserSettings;
  selectedBookIds: Id[];
  currentBookId: Id;
  favoriteQuestionIds: Id[];
  favoriteWordIds: Id[];
  wrongQuestions: Record<Id, WrongQuestionRecord>;
  sessions: Record<Id, PracticeSession>;
  answerRecords: AnswerRecord[];
  wordLearning: Record<Id, WordLearningState>;
  wordLogs: WordLearningLog[];
  dailyStats: Record<string, DailyStudy>;
}
