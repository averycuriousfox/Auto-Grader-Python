#!/usr/bin/env node

/**
 * CLI Agent: Converts natural language questions into Python junior challenges
 * with automated test cases using Google Gemini 3.8 Flash.
 *
 * Usage:
 *   node scripts/generate-challenge.mjs --prompt "Ask user for two numbers, print their product"
 *   npm run generate-challenge
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const CHALLENGE_SCHEMA = {
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
          name: { type: 'string', description: 'Brief test title' },
          input: {
            type: 'string',
            description: 'Simulated standard input lines provided to input(). Separate multiple lines with newlines.',
          },
          expectedOutput: {
            type: 'string',
            description: 'Exact expected stdout from print() statements.',
          },
          explanation: {
            type: 'string',
            description: 'Why this test case is important',
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

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

// Parse simple CLI flags
function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx < process.argv.length - 1) {
    return process.argv[idx + 1];
  }
  return null;
}

async function main() {
  console.log('\n======================================================');
  console.log('🐍 Python Junior Autograder - Challenge Generator Agent');
  console.log('   Powered by Google Gemini 3.8 Flash');
  console.log('======================================================\n');

  // Check API Key
  let apiKey = process.env.GEMINI_API_KEY || getArg('--key');
  if (!apiKey) {
    // Try to read .env file if present
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf-8');
      const match = envContent.match(/GEMINI_API_KEY=(.+)/);
      if (match) apiKey = match[1].trim();
    }
  }

  if (!apiKey) {
    apiKey = await askQuestion('🔑 Enter your Google Gemini API Key: ');
    if (!apiKey) {
      console.error('❌ API key is required to generate challenges.');
      process.exit(1);
    }
  }

  // Get prompt
  let promptText = getArg('--prompt') || getArg('-p');
  if (!promptText) {
    promptText = await askQuestion('📝 Describe your challenge in plain English:\n> ');
    if (!promptText) {
      console.error('❌ Challenge description cannot be empty.');
      process.exit(1);
    }
  }

  // Get difficulty
  let difficulty = getArg('--difficulty') || 'Beginner';
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
    difficulty = 'Beginner';
  }

  console.log('\n🤖 Contacting Gemini 3.8 Flash to generate challenge & test cases...');

  const client = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an expert primary school computer science curriculum designer and Python educator.
Convert natural language teacher instructions into crystal-clear, delightful coding challenges for children aged 7-12.
Rules:
1. Keep instructions simple, friendly, and free of jargon.
2. Ensure expectedOutput matches the exact output produced by the solutionCode.
3. Generate 3 to 4 high-quality test cases covering standard cases and simple kid-friendly edge cases.
4. Provide a 100% correct reference solution in solutionCode.
5. Provide 2-3 encouraging hints.`;

  try {
    const interaction = await client.interactions.create({
      model: 'gemini-3.8-flash',
      input: [
        { type: 'text', text: systemInstruction },
        {
          type: 'text',
          text: `Create a Python junior coding challenge based on:
"""
${promptText}
"""
Target difficulty: ${difficulty}`,
        },
      ],
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: CHALLENGE_SCHEMA,
      },
    });

    const parsed = JSON.parse(interaction.output_text);
    const id = 'ch_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const fullChallenge = {
      id,
      ...parsed,
      testCases: parsed.testCases.map((tc, idx) => ({
        id: `tc_${idx + 1}`,
        ...tc,
        isHidden: idx >= 3,
      })),
      createdAt: new Date().toISOString(),
    };

    // Output Directory
    const outDir = path.resolve(process.cwd(), 'challenges');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const safeFilename =
      fullChallenge.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30) || 'challenge';
    const filePath = path.join(outDir, `${safeFilename}_${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullChallenge, null, 2), 'utf-8');

    console.log('\n✅ Challenge successfully generated and saved!');
    console.log(`📁 File saved: ${path.relative(process.cwd(), filePath)}`);
    console.log(`🏆 Title: ${fullChallenge.title}`);
    console.log(`📊 Difficulty: ${fullChallenge.difficulty}`);
    console.log(`📂 Category: ${fullChallenge.category}`);
    console.log(`🧪 Test Cases: ${fullChallenge.testCases.length}`);
    console.log('\nReference Solution:');
    console.log('-------------------');
    console.log(fullChallenge.solutionCode);
    console.log('-------------------\n');
    console.log('Tip: You can import this JSON file into the web app using the "Import" button!\n');
  } catch (err) {
    console.error('❌ Error generating challenge:', err.message || err);
    process.exit(1);
  }
}

main();
