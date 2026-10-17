import { addDays, format, parseISO, startOfDay, differenceInCalendarDays } from 'date-fns';
import { RevisionSession } from '../types';
import { DEFAULT_OFFSETS } from './constants';

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Generates initial schedule for a newly studied topic
 * Day 1 = first study date
 * Rev 1 = Day 2 (+1 day)
 * Rev 2 = Day 4 (+3 days)
 * Rev 3 = Day 7 (+6 days)
 * Rev 4 = Day 15 (+14 days)
 * Rev 5 = Day 30 (+29 days)
 * Rev 6 = Day 60 (+59 days)
 * Rev 7 = Day 90 (+89 days)
 */
export function generateInitialSchedule(topicId: string, firstStudiedDate: string): RevisionSession[] {
  const baseDate = parseISO(firstStudiedDate);

  return DEFAULT_OFFSETS.map((item) => {
    const scheduled = addDays(baseDate, item.offsetDays);
    return {
      id: crypto.randomUUID(),
      topicId,
      sequenceNumber: item.sequence,
      scheduledDate: formatDateKey(scheduled),
      status: 'PENDING',
      durationMinutes: 30,
      questionsAttempted: 0,
      questionsCorrect: 0
    };
  });
}

function getOffsetForSequence(seq: number): number {
  const found = DEFAULT_OFFSETS.find(o => o.sequence === seq);
  if (found) return found.offsetDays;
  if (seq <= 0) return 0;
  return 90 + (seq - 7) * 30; // After Day 90, progress by monthly intervals
}

/**
 * Adaptive Spaced Repetition Logic
 * Rating 1: Review weak concepts the next day (+1 day)
 * Rating 2: Repeat in 2 days (+2 days)
 * Rating 3: Continue with next planned interval
 * Rating 4: Progress to next longer interval
 */
export function computeNextAdaptiveSession(
  topicId: string,
  completedSequence: number,
  completionDate: string,
  recallRating: 1 | 2 | 3 | 4
): RevisionSession {
  const cDate = parseISO(completionDate);
  let nextDate: Date;
  let nextSequence = completedSequence + 1;

  switch (recallRating) {
    case 1:
      // Forgot almost everything -> Review tomorrow
      nextDate = addDays(cDate, 1);
      nextSequence = completedSequence; // Repeat current difficulty tier
      break;
    case 2:
      // Remembered a little -> Repeat in 2 days
      nextDate = addDays(cDate, 2);
      nextSequence = completedSequence; // Reinforce current tier
      break;
    case 3:
      // Remembered most -> Standard interval jump based on sequence
      {
        const defaultNextOffset = getOffsetForSequence(completedSequence + 1) - getOffsetForSequence(completedSequence);
        const jump = defaultNextOffset > 0 ? defaultNextOffset : 7;
        nextDate = addDays(cDate, jump);
        nextSequence = completedSequence + 1;
      }
      break;
    case 4:
      // Remembered confidently -> Accelerated interval
      {
        const acceleratedJump = Math.max(14, (getOffsetForSequence(completedSequence + 2) - getOffsetForSequence(completedSequence)));
        nextDate = addDays(cDate, acceleratedJump || 15);
        nextSequence = completedSequence + 2;
      }
      break;
  }

  return {
    id: crypto.randomUUID(),
    topicId,
    sequenceNumber: nextSequence,
    scheduledDate: formatDateKey(nextDate),
    status: 'PENDING',
    durationMinutes: 25,
    questionsAttempted: 0,
    questionsCorrect: 0
  };
}

/**
 * Categorizes a revision session based on today's date
 */
export function getSessionStatus(session: RevisionSession, todayStr: string): 'COMPLETED' | 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' {
  if (session.status === 'COMPLETED') return 'COMPLETED';
  if (session.scheduledDate === todayStr) return 'DUE_TODAY';
  if (session.scheduledDate < todayStr) return 'OVERDUE';
  return 'UPCOMING';
}

/**
 * Calculates current streak and longest streak from activity dates
 */
export function calculateStreaks(activityDates: string[], todayStr: string): { currentStreak: number; longestStreak: number } {
  if (!activityDates || activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueSortedDates = Array.from(new Set(activityDates))
    .sort()
    .map(d => parseISO(d));

  if (uniqueSortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = startOfDay(parseISO(todayStr));
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const date of uniqueSortedDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diff = differenceInCalendarDays(date, prevDate);
      if (diff === 1) {
        tempStreak += 1;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = date;
  }

  // Current streak calculation: must include today or yesterday to be alive
  const lastActiveDate = uniqueSortedDates[uniqueSortedDates.length - 1];
  const daysSinceLast = differenceInCalendarDays(today, lastActiveDate);

  let currentStreak = 0;
  if (daysSinceLast === 0 || daysSinceLast === 1) {
    currentStreak = 1;
    for (let i = uniqueSortedDates.length - 1; i > 0; i--) {
      const diff = differenceInCalendarDays(uniqueSortedDates[i], uniqueSortedDates[i - 1]);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
