export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TestCase {
  id: string;
  name: string;
  input: string;             // Simulates lines passed into input()
  expectedOutput: string;    // Expected captured stdout
  isHidden?: boolean;        // Hidden challenge test
  explanation?: string;      // Kid-friendly description of what this test checks
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;          // e.g., "Print & Text", "Variables", "Math", "If Else", "Loops"
  description: string;       // Markdown-supported kid-friendly problem statement
  starterCode: string;       // Pre-filled template code in editor
  solutionCode?: string;     // Reference solution verified during AI generation
  hints: string[];           // Step-by-step friendly hints
  testCases: TestCase[];
  createdAt?: string;
  tags?: string[];
}

export interface SingleTestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  error?: string;
  friendlyError?: string;
  executionTimeMs: number;
}

export interface GradingReport {
  challengeId: string;
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: SingleTestResult[];
  runtimeError?: string;
  friendlyError?: string;
  rawTraceback?: string;
}

export interface StudentProgress {
  completedChallengeIds: string[];
  stars: number;
  codeDrafts: Record<string, string>; // challengeId -> student code
}
