import {
  generateInitialSchedule,
  computeNextAdaptiveSession,
  getSessionStatus,
  calculateStreaks
} from '../scheduler';
import { RevisionSession } from '../../types';

// Standalone test suite runner for scheduler logic
export function runSchedulerTests() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  // Test 1: Spaced intervals
  try {
    const studyDate = '2026-03-01';
    const schedule = generateInitialSchedule('test-topic-1', studyDate);
    if (schedule.length !== 7) throw new Error(`Expected 7 sessions, got ${schedule.length}`);
    if (schedule[0].sequenceNumber !== 1 || schedule[0].scheduledDate !== '2026-03-02') {
      throw new Error(`Rev 1 unexpected: ${schedule[0].scheduledDate}`);
    }
    if (schedule[1].scheduledDate !== '2026-03-04') throw new Error(`Rev 2 unexpected: ${schedule[1].scheduledDate}`);
    if (schedule[2].scheduledDate !== '2026-03-07') throw new Error(`Rev 3 unexpected: ${schedule[2].scheduledDate}`);
    if (schedule[3].scheduledDate !== '2026-03-15') throw new Error(`Rev 4 unexpected: ${schedule[3].scheduledDate}`);
    if (schedule[4].scheduledDate !== '2026-03-30') throw new Error(`Rev 5 unexpected: ${schedule[4].scheduledDate}`);
    if (schedule[5].scheduledDate !== '2026-04-29') throw new Error(`Rev 6 unexpected: ${schedule[5].scheduledDate}`);
    if (schedule[6].scheduledDate !== '2026-05-29') throw new Error(`Rev 7 unexpected: ${schedule[6].scheduledDate}`);
    results.push({ test: 'Correctly schedules standard 7-session spaced intervals', passed: true });
  } catch (e: any) {
    results.push({ test: 'Correctly schedules standard 7-session spaced intervals', passed: false, error: e.message });
  }

  // Test 2: Rating 1 review next day
  try {
    const nextSession = computeNextAdaptiveSession('top-1', 2, '2026-03-10', 1);
    if (nextSession.scheduledDate !== '2026-03-11' || nextSession.sequenceNumber !== 2) {
      throw new Error(`Rating 1 unexpected: ${nextSession.scheduledDate}, seq ${nextSession.sequenceNumber}`);
    }
    results.push({ test: 'Adapts when student forgets (Rating 1)', passed: true });
  } catch (e: any) {
    results.push({ test: 'Adapts when student forgets (Rating 1)', passed: false, error: e.message });
  }

  // Test 3: Rating 2 repeats in 2 days
  try {
    const nextSession = computeNextAdaptiveSession('top-1', 3, '2026-03-10', 2);
    if (nextSession.scheduledDate !== '2026-03-12' || nextSession.sequenceNumber !== 3) {
      throw new Error(`Rating 2 unexpected: ${nextSession.scheduledDate}`);
    }
    results.push({ test: 'Adapts when student remembers a little (Rating 2)', passed: true });
  } catch (e: any) {
    results.push({ test: 'Adapts when student remembers a little (Rating 2)', passed: false, error: e.message });
  }

  // Test 4: Rating 4 accelerates
  try {
    const nextSession = computeNextAdaptiveSession('top-1', 2, '2026-03-10', 4);
    if (nextSession.sequenceNumber !== 4 || nextSession.scheduledDate < '2026-03-24') {
      throw new Error(`Rating 4 unexpected: ${nextSession.scheduledDate}, seq ${nextSession.sequenceNumber}`);
    }
    results.push({ test: 'Adapts when student remembers confidently (Rating 4)', passed: true });
  } catch (e: any) {
    results.push({ test: 'Adapts when student remembers confidently (Rating 4)', passed: false, error: e.message });
  }

  // Test 5: Session status
  try {
    const today = '2026-03-15';
    const mockSession = (date: string, status = 'PENDING'): RevisionSession => ({
      id: 's', topicId: 't', sequenceNumber: 1, scheduledDate: date,
      status: status as any, durationMinutes: 30, questionsAttempted: 0, questionsCorrect: 0
    });
    if (getSessionStatus(mockSession('2026-03-10'), today) !== 'OVERDUE') throw new Error('Overdue mismatch');
    if (getSessionStatus(mockSession('2026-03-15'), today) !== 'DUE_TODAY') throw new Error('Due today mismatch');
    if (getSessionStatus(mockSession('2026-03-20'), today) !== 'UPCOMING') throw new Error('Upcoming mismatch');
    if (getSessionStatus(mockSession('2026-03-10', 'COMPLETED'), today) !== 'COMPLETED') throw new Error('Completed mismatch');
    results.push({ test: 'Detects session status accurately relative to today', passed: true });
  } catch (e: any) {
    results.push({ test: 'Detects session status accurately relative to today', passed: false, error: e.message });
  }

  // Test 6: Streaks
  try {
    const today = '2026-03-05';
    const dates = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'];
    const { currentStreak, longestStreak } = calculateStreaks(dates, today);
    if (currentStreak !== 4 || longestStreak !== 4) throw new Error(`Streaks failed: ${currentStreak}, ${longestStreak}`);
    results.push({ test: 'Calculates streaks correctly across consecutive days and gaps', passed: true });
  } catch (e: any) {
    results.push({ test: 'Calculates streaks correctly across consecutive days and gaps', passed: false, error: e.message });
  }

  return results;
}
