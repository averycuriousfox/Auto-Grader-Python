import { GoogleGenAI } from '@google/genai';
import { Challenge, TestCase } from '../types/challenge';
import { gradeStudentSubmission } from './pyodideRunner';

export interface GenerateChallengeParams {
  apiKey: string;
  teacherPrompt: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  numTestCases?: number;
}

export interface GenerationResult {
  challenge: Challenge;
  verifiedWithPyodide: boolean;
  verificationReport?: any;
}

const CHALLENGE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Fun, engaging title for primary school kids' },
    difficulty: {
      type: 'string',
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      description: 'Difficulty level suitable for kids aged 7-12',
    },
    category: {
      type: 'string',
      description: 'Curriculum category, e.g. "Print & Text", "Variables", "Math", "If Else", "Loops"',
    },
    description: {
      type: 'string',
      description:
        'Kid-friendly instructions written in clear, encouraging markdown. Detail what input() to expect and what print() output is required.',
    },
    starterCode: {
      type: 'string',
      description: 'Starter Python code skeleton with helpful comments to guide the student',
    },
    solutionCode: {
      type: 'string',
      description: 'Accurate, clean Python reference solution that satisfies all test cases',
    },
    hints: {
      type: 'array',
      items: { type: 'string' },
      description: '2 to 3 progressive hints from gentle reminder to code structure tip',
    },
    testCases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Brief test title, e.g. "Test 1: Standard input"' },
          input: {
            type: 'string',
            description:
              'Simulated standard input lines provided to input(). If multiple inputs, separate with newlines.',
          },
          expectedOutput: {
            type: 'string',
            description: 'Exact expected stdout from print() statements. Do not include input prompt echoes.',
          },
          explanation: {
            type: 'string',
            description: 'Why this test case is important (e.g. testing zero, negative, or regular case)',
          },
        },
        required: ['name', 'input', 'expectedOutput'],
      },
    },
  },
  required: [
    'title',
    'difficulty',
    'category',
    'description',
    'starterCode',
    'solutionCode',
    'hints',
    'testCases',
  ],
};

/**
 * Uses Google Gemini 3.8 Flash to transform a teacher's natural language question
 * into a structured Challenge with comprehensive test cases and reference solution.
 */
export async function generateChallengeFromPrompt(
  params: GenerateChallengeParams
): Promise<GenerationResult> {
  const { apiKey, teacherPrompt, difficulty = 'Beginner', numTestCases = 4 } = params;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Please provide a valid Gemini API key.');
  }

  const client = new GoogleGenAI({ apiKey: apiKey.trim() });

  const systemInstruction = `You are an expert primary school computer science curriculum designer and Python educator.
Your role is to convert natural language teacher instructions into crystal-clear, delightful coding challenges for children aged 7-12.

Rules:
1. Target Audience: Primary school kids learning Python. Keep instructions simple, friendly, and free of jargon.
2. Standard I/O Testing:
   - The student will run their code in an automated I/O tester.
   - When using input(), Python code does NOT need to worry about prompt text affecting stdout comparison, but keep expectedOutput strictly matching what print() outputs.
   - Ensure the expectedOutput matches the exact output produced by the solutionCode when given the testCase input.
3. Generate ${numTestCases} high-quality test cases covering standard cases and simple kid-friendly edge cases (e.g. zero, double digits, or different names).
4. Provide a 100% correct reference solution in solutionCode.
5. Provide 2-3 encouraging hints.`;

  const userMessage = `Create a Python junior coding challenge based on this teacher's request:
"""
${teacherPrompt}
"""
Target difficulty: ${difficulty}
Please output valid JSON matching the specified schema.`;

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash',
    input: [
      { type: 'text', text: systemInstruction },
      { type: 'text', text: userMessage },
    ],
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: CHALLENGE_JSON_SCHEMA,
    },
  });

  const responseText = interaction.output_text;
  if (!responseText) {
    throw new Error('No response received from Gemini.');
  }

  const rawParsed = JSON.parse(responseText);

  const challengeId = 'ch_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

  const testCases: TestCase[] = (rawParsed.testCases || []).map((tc: any, index: number) => ({
    id: `tc_${index + 1}`,
    name: tc.name || `Test Case ${index + 1}`,
    input: tc.input || '',
    expectedOutput: tc.expectedOutput || '',
    explanation: tc.explanation || '',
    isHidden: index >= 3, // Make 4th test case a hidden challenge if there are 4+
  }));

  const challenge: Challenge = {
    id: challengeId,
    title: rawParsed.title || 'Fun Python Challenge',
    difficulty: rawParsed.difficulty || difficulty,
    category: rawParsed.category || 'General',
    description: rawParsed.description || '',
    starterCode: rawParsed.starterCode || '# Write your code here!\n',
    solutionCode: rawParsed.solutionCode || '',
    hints: rawParsed.hints || [],
    testCases,
    createdAt: new Date().toISOString(),
  };

  // Pre-validate the reference solution against generated test cases using Pyodide
  let verifiedWithPyodide = false;
  let verificationReport: any = null;

  try {
    if (challenge.solutionCode && challenge.testCases.length > 0) {
      verificationReport = await gradeStudentSubmission(
        challenge.id,
        challenge.solutionCode,
        challenge.testCases
      );
      verifiedWithPyodide = verificationReport.allPassed;

      // If Pyodide produced slightly different actual output, auto-sync expectedOutput
      // with the reference solution's actual output so student won't fail due to minor formatting discrepancies
      if (!verifiedWithPyodide && verificationReport.results) {
        let fixedCount = 0;
        challenge.testCases = challenge.testCases.map((tc, idx) => {
          const res = verificationReport.results[idx];
          if (res && !res.error && res.actualOutput !== tc.expectedOutput) {
            fixedCount++;
            return {
              ...tc,
              expectedOutput: res.actualOutput,
            };
          }
          return tc;
        });

        if (fixedCount > 0) {
          // Re-verify
          verificationReport = await gradeStudentSubmission(
            challenge.id,
            challenge.solutionCode,
            challenge.testCases
          );
          verifiedWithPyodide = verificationReport.allPassed;
        }
      }
    }
  } catch (verifyErr) {
    console.warn('Pyodide verification during challenge creation skipped:', verifyErr);
  }

  return {
    challenge,
    verifiedWithPyodide,
    verificationReport,
  };
}
