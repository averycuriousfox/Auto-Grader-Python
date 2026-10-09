import { Challenge, StudentProgress } from '../types/challenge';

const STORAGE_KEYS = {
  CHALLENGES: 'py_junior_challenges_v1',
  PROGRESS: 'py_junior_progress_v1',
  GEMINI_API_KEY: 'py_junior_gemini_api_key',
  FONT_SIZE: 'py_junior_font_size',
};

const DEFAULT_PROGRESS: StudentProgress = {
  completedChallengeIds: [],
  stars: 0,
  codeDrafts: {},
};

export function getStoredChallenges(): Challenge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading challenges from localStorage', err);
    return [];
  }
}

export function saveChallenges(challenges: Challenge[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
  } catch (err) {
    console.error('Error saving challenges to localStorage', err);
  }
}

export function addChallenge(challenge: Challenge): Challenge[] {
  const current = getStoredChallenges();
  // If exists, update; otherwise prepend
  const existsIdx = current.findIndex((c) => c.id === challenge.id);
  let updated: Challenge[];
  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = challenge;
  } else {
    updated = [challenge, ...current];
  }
  saveChallenges(updated);
  return updated;
}

export function deleteChallenge(challengeId: string): Challenge[] {
  const current = getStoredChallenges();
  const updated = current.filter((c) => c.id !== challengeId);
  saveChallenges(updated);
  return updated;
}

export function getStudentProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading student progress', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveStudentProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Error saving student progress', err);
  }
}

export function markChallengeCompleted(challengeId: string): StudentProgress {
  const progress = getStudentProgress();
  if (!progress.completedChallengeIds.includes(challengeId)) {
    progress.completedChallengeIds.push(challengeId);
    progress.stars += 3; // 3 stars per completed challenge
    saveStudentProgress(progress);
  }
  return progress;
}

export function saveStudentCodeDraft(challengeId: string, code: string): void {
  const progress = getStudentProgress();
  progress.codeDrafts[challengeId] = code;
  saveStudentProgress(progress);
}

export function getStudentCodeDraft(challengeId: string, defaultCode: string): string {
  const progress = getStudentProgress();
  return progress.codeDrafts[challengeId] !== undefined ? progress.codeDrafts[challengeId] : defaultCode;
}

export function resetStudentProgress(): StudentProgress {
  saveStudentProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}

export function getStoredGeminiKey(): string {
  return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
}

export function saveStoredGeminiKey(key: string): void {
  localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
}

export function getStoredFontSize(): number {
  const val = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
  return val ? parseInt(val, 10) : 16;
}

export function saveStoredFontSize(size: number): void {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size.toString());
}

/**
 * Exports all current challenges as a downloadable JSON file.
 */
export function exportChallengesAsJSON(challenges: Challenge[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(challenges, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `python-junior-challenges-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
