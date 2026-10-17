import { SubjectItem } from '../types';

export const GATE_CSE_SUBJECTS: string[] = [
  'Engineering Mathematics',
  'Discrete Mathematics',
  'Digital Logic',
  'Computer Organization and Architecture',
  'Programming and Data Structures',
  'Algorithms',
  'Theory of Computation',
  'Compiler Design',
  'Operating Systems',
  'Databases',
  'Computer Networks',
  'General Aptitude'
];

export const GATE_DA_SUBJECTS: string[] = [
  'Probability and Statistics',
  'Linear Algebra',
  'Calculus and Optimization',
  'Programming, Data Structures and Algorithms',
  'Database Management and Warehousing',
  'Machine Learning',
  'Artificial Intelligence',
  'General Aptitude'
];

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  ...GATE_CSE_SUBJECTS.map((name, i) => ({
    id: `cse-subj-${i}`,
    name,
    exam: (['Engineering Mathematics', 'General Aptitude'].includes(name) ? 'BOTH' : 'CSE') as SubjectItem['exam']
  })),
  ...GATE_DA_SUBJECTS.filter(s => !['Engineering Mathematics', 'General Aptitude'].includes(s)).map((name, i) => ({
    id: `da-subj-${i}`,
    name,
    exam: 'DA' as SubjectItem['exam']
  }))
];

// Spaced Repetition offsets (Calendar offsets relative to Day 1 = 0 offset)
export const DEFAULT_OFFSETS = [
  { sequence: 1, offsetDays: 1, label: 'Rev 1 (Day 2)' },
  { sequence: 2, offsetDays: 3, label: 'Rev 2 (Day 4)' },
  { sequence: 3, offsetDays: 6, label: 'Rev 3 (Day 7)' },
  { sequence: 4, offsetDays: 14, label: 'Rev 4 (Day 15)' },
  { sequence: 5, offsetDays: 29, label: 'Rev 5 (Day 30)' },
  { sequence: 6, offsetDays: 59, label: 'Rev 6 (Day 60)' },
  { sequence: 7, offsetDays: 89, label: 'Rev 7 (Day 90)' }
];
