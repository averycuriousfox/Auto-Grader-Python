import { Challenge } from '../types/challenge';

export const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'sample_1_hello_world',
    title: 'Hello, World! 🚀',
    difficulty: 'Beginner',
    category: 'Print & Text',
    description: `### Welcome to Python! 🐍

Every coder starts with the legendary **Hello, World!** program.

#### Your Mission:
Use Python's \`print()\` command to display the exact text:
\`\`\`
Hello, World!
\`\`\`

#### Example Output:
\`\`\`
Hello, World!
\`\`\`

> 💡 **Tip:** In Python, make sure to put double quotes \`"\` or single quotes \`'\` around text!`,
    starterCode: `# Type your print command below:
print("Hello, World!")
`,
    solutionCode: `print("Hello, World!")`,
    hints: [
      'Use the print function: print("...")',
      'Make sure spelling and punctuation match exactly: "Hello, World!" with a comma and exclamation mark!'
    ],
    testCases: [
      {
        id: 'tc_1',
        name: 'Greeting Check',
        input: '',
        expectedOutput: 'Hello, World!',
        explanation: 'Checks if the exact greeting is printed.'
      }
    ]
  },
  {
    id: 'sample_2_favorite_pet',
    title: 'My Favorite Pet 🐶',
    difficulty: 'Beginner',
    category: 'Input & Variables',
    description: `### Meet Your Pet!

Let's practice asking for the user's input and using a variable.

#### Your Mission:
1. Ask the user for their pet's name using \`input()\`.
2. Print: \`[Name] is the best pet ever!\`

#### Example Run:
- If the user types: \`Buddy\`
- Your program should print:
\`\`\`
Buddy is the best pet ever!
\`\`\``,
    starterCode: `# 1. Ask for pet name:
pet_name = input()

# 2. Print the sentence:
print(pet_name, "is the best pet ever!")
`,
    solutionCode: `pet_name = input()
print(f"{pet_name} is the best pet ever!")`,
    hints: [
      'Store input in a variable: pet_name = input()',
      'You can join strings using a formatted string or commas in print: print(pet_name, "is the best pet ever!")'
    ],
    testCases: [
      {
        id: 'tc_1',
        name: 'Buddy the Dog',
        input: 'Buddy',
        expectedOutput: 'Buddy is the best pet ever!',
        explanation: 'Tests standard input name.'
      },
      {
        id: 'tc_2',
        name: 'Whiskers the Cat',
        input: 'Whiskers',
        expectedOutput: 'Whiskers is the best pet ever!',
        explanation: 'Tests a second animal name.'
      },
      {
        id: 'tc_3',
        name: 'Pip the Hamster',
        input: 'Pip',
        expectedOutput: 'Pip is the best pet ever!',
        explanation: 'Tests short name.'
      }
    ]
  },
  {
    id: 'sample_3_double_magic',
    title: 'Double Trouble Machine 🪄',
    difficulty: 'Beginner',
    category: 'Math & Numbers',
    description: `### The Number Doubler!

Can you create a machine that doubles any number fed into it?

#### Your Mission:
1. Read an integer number from the user with \`int(input())\`.
2. Multiply it by 2.
3. Print the result!

#### Example Run:
- Input: \`5\`
- Output: \`10\`
- Input: \`12\`
- Output: \`24\``,
    starterCode: `# Read a number from the user:
num = int(input())

# Multiply by 2 and print:
# Write your code here!
`,
    solutionCode: `num = int(input())
print(num * 2)`,
    hints: [
      'Remember to use int(input()) because input() gives text instead of numbers.',
      'In Python, the * symbol is used for multiplication.'
    ],
    testCases: [
      {
        id: 'tc_1',
        name: 'Double 5',
        input: '5',
        expectedOutput: '10',
        explanation: '5 * 2 = 10'
      },
      {
        id: 'tc_2',
        name: 'Double 12',
        input: '12',
        expectedOutput: '24',
        explanation: '12 * 2 = 24'
      },
      {
        id: 'tc_3',
        name: 'Double 0',
        input: '0',
        expectedOutput: '0',
        explanation: 'Zero edge case: 0 * 2 = 0'
      }
    ]
  }
];
