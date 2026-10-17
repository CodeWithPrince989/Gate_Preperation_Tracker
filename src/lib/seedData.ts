import { Topic, RevisionSession, PracticeLog, StudyActivity } from '../types';
import { format, subDays, addDays } from 'date-fns';

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');
const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
const threeDaysAgoStr = format(subDays(today, 3), 'yyyy-MM-dd');
const sevenDaysAgoStr = format(subDays(today, 7), 'yyyy-MM-dd');
const fifteenDaysAgoStr = format(subDays(today, 15), 'yyyy-MM-dd');

export const INITIAL_SEED_TOPICS: Topic[] = [
  {
    id: 'top-1',
    name: 'Relational Database Normalization (1NF to BCNF)',
    subjectName: 'Databases',
    exam: 'BOTH',
    firstStudiedAt: sevenDaysAgoStr,
    topicType: 'Mixed',
    learningSource: 'Lecture',
    initialConfidence: 'Medium',
    estimatedDifficulty: 'Hard',
    masteryStatus: 'Revising',
    notes: 'Remember: 3NF allows prime attribute on RHS of FD. BCNF requires LHS to be superkey strictly.',
    resourceUrl: 'https://gateoverflow.in',
    checklist: [
      { id: 'c1', text: 'Lossless join test with table intersection', done: true },
      { id: 'c2', text: 'Dependency preservation check with projection', done: true },
      { id: 'c3', text: 'Minimal cover computation', done: false }
    ],
    createdAt: sevenDaysAgoStr
  },
  {
    id: 'top-2',
    name: 'Virtual Memory & Multi-level Paging',
    subjectName: 'Operating Systems',
    exam: 'CSE',
    firstStudiedAt: fifteenDaysAgoStr,
    topicType: 'Numerical',
    learningSource: 'Notes',
    initialConfidence: 'High',
    estimatedDifficulty: 'Medium',
    masteryStatus: 'Revising',
    notes: 'Effective memory access time calculation with TLB hit and miss ratios.',
    resourceUrl: '',
    checklist: [
      { id: 'c4', text: 'Page table entry size calculation', done: true },
      { id: 'c5', text: 'Inverted page table space comparison', done: false }
    ],
    createdAt: fifteenDaysAgoStr
  },
  {
    id: 'top-3',
    name: 'Eigenvalues, SVD & PCA Dimensionality Reduction',
    subjectName: 'Linear Algebra',
    exam: 'DA',
    firstStudiedAt: threeDaysAgoStr,
    topicType: 'Numerical',
    learningSource: 'Book',
    initialConfidence: 'Low',
    estimatedDifficulty: 'Hard',
    masteryStatus: 'Learning',
    notes: 'Covariance matrix symmetry implies orthogonal eigenvectors. Singular values are square roots of eigenvalues of A^T A.',
    resourceUrl: '',
    checklist: [
      { id: 'c6', text: 'Characteristic polynomial roots', done: true },
      { id: 'c7', text: 'Gram-Schmidt orthonormalization', done: false }
    ],
    createdAt: threeDaysAgoStr
  },
  {
    id: 'top-4',
    name: 'Gradient Descent & Backpropagation Mathematics',
    subjectName: 'Machine Learning',
    exam: 'DA',
    firstStudiedAt: yesterdayStr,
    topicType: 'Theory',
    learningSource: 'Lecture',
    initialConfidence: 'Medium',
    estimatedDifficulty: 'Medium',
    masteryStatus: 'Learning',
    notes: 'Chain rule of partial derivatives across activation layers. Vanishing gradient with Sigmoid.',
    resourceUrl: '',
    checklist: [
      { id: 'c8', text: 'Jacobian and Hessian matrix derivation', done: false }
    ],
    createdAt: yesterdayStr
  }
];

export const INITIAL_SEED_SESSIONS: RevisionSession[] = [
  // Topic 1: Due TODAY
  {
    id: 'ses-1',
    topicId: 'top-1',
    sequenceNumber: 3,
    scheduledDate: todayStr,
    status: 'PENDING',
    durationMinutes: 30,
    questionsAttempted: 0,
    questionsCorrect: 0
  },
  // Topic 2: Overdue session (missed 2 days ago)
  {
    id: 'ses-2',
    topicId: 'top-2',
    sequenceNumber: 4,
    scheduledDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    status: 'PENDING',
    durationMinutes: 35,
    questionsAttempted: 0,
    questionsCorrect: 0
  },
  // Topic 3: Due TODAY
  {
    id: 'ses-3',
    topicId: 'top-3',
    sequenceNumber: 2,
    scheduledDate: todayStr,
    status: 'PENDING',
    durationMinutes: 40,
    questionsAttempted: 0,
    questionsCorrect: 0
  },
  // Topic 4: Due Tomorrow (Upcoming)
  {
    id: 'ses-4',
    topicId: 'top-4',
    sequenceNumber: 1,
    scheduledDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    status: 'PENDING',
    durationMinutes: 25,
    questionsAttempted: 0,
    questionsCorrect: 0
  },
  // Completed history session
  {
    id: 'ses-hist-1',
    topicId: 'top-1',
    sequenceNumber: 1,
    scheduledDate: format(subDays(today, 6), 'yyyy-MM-dd'),
    completedAt: subDays(today, 6).toISOString(),
    status: 'COMPLETED',
    durationMinutes: 25,
    recallRating: 3,
    questionsAttempted: 5,
    questionsCorrect: 4,
    mistakesSummary: 'Forgot candidate key definition with multiple minimal keys',
    retrievalNotes: 'Recalled 1NF, 2NF, 3NF cleanly.'
  }
];

export const INITIAL_SEED_LOGS: PracticeLog[] = [
  {
    id: 'log-1',
    topicId: 'top-1',
    subjectName: 'Databases',
    exam: 'CSE',
    gateYear: 2023,
    questionRef: 'GATE CSE 2023 Set 1 Q34',
    marks: 2.0,
    result: 'CORRECT',
    timeTakenSeconds: 150,
    errorCategory: 'None',
    explanation: 'Checked BCNF violations by identifying non-superkey determinants correctly.',
    solvedIndependently: true,
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd')
  },
  {
    id: 'log-2',
    topicId: 'top-2',
    subjectName: 'Operating Systems',
    exam: 'CSE',
    gateYear: 2022,
    questionRef: 'GATE CSE 2022 Q18',
    marks: 2.0,
    result: 'INCORRECT',
    timeTakenSeconds: 210,
    errorCategory: 'Calculation',
    explanation: 'Miscalculated number of bits required for frame offset in 2-level paging.',
    solvedIndependently: false,
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd')
  }
];

export const INITIAL_SEED_ACTIVITIES: StudyActivity[] = [
  { id: 'act-1', activityDate: format(subDays(today, 4), 'yyyy-MM-dd'), activityType: 'NEW_TOPIC', durationMinutes: 60 },
  { id: 'act-2', activityDate: format(subDays(today, 3), 'yyyy-MM-dd'), activityType: 'REVISION', durationMinutes: 45 },
  { id: 'act-3', activityDate: format(subDays(today, 2), 'yyyy-MM-dd'), activityType: 'PYQ', durationMinutes: 30 },
  { id: 'act-4', activityDate: yesterdayStr, activityType: 'REVISION', durationMinutes: 50 },
  { id: 'act-5', activityDate: todayStr, activityType: 'PYQ', durationMinutes: 20 }
];
