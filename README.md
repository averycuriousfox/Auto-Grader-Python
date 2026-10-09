# 🐍 Python Junior Autograder (Primary School Edition) ✨

A kid-friendly automated Python code grader designed specifically for primary school students (ages 7–12) learning Python.

- **100% Client-Side WebAssembly Execution**: Powered by [Pyodide](https://pyodide.org/) in the browser. Zero server costs, zero security risk running untrusted student code, and fully offline-ready for students during grading.
- **Friendly Error Translator**: Converts scary, cryptic Python stack traces (`IndentationError`, `NameError: name 'pritn' is not defined`, `unexpected EOF`) into gentle, encouraging explanations and tips.
- **AI Challenge Maker (Gemini 3.8 Flash)**: Convert plain English descriptions into complete challenges with reference solutions, starter skeletons, and automated input/output test cases.
- **Gamified Rewards**: Celebratory confetti, stars, and level completion tracking saved in browser `localStorage` (no account/password required for kids).
- **GitHub Pages Ready**: Includes automated GitHub Actions workflow to build and deploy to GitHub Pages on every push.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 Generating Challenges from Natural Language

You can create challenges using two modes:

### Mode 1: In-App Teacher AI Studio (Recommended)
1. Click the **"Teacher AI Studio"** button in the top navigation bar.
2. Enter your Google Gemini API key (you can grab a free key from [Google AI Studio](https://aistudio.google.com/app/apikey)). It is stored strictly in your local browser storage.
3. Describe your problem in plain English, e.g.:
   > *"Ask the student for two numbers using input(), calculate their sum, and print 'The sum is [total]'. Also test with negative numbers and zero."*
4. Choose the difficulty (`Beginner`, `Intermediate`, `Advanced`) and number of test cases.
5. Click **"Generate Challenge & Verify with Pyodide"**.
6. The app will generate the challenge, create test cases, write a reference solution, and **test it live in Pyodide** to guarantee 100% passing tests before you save it!
7. Click **"Save to Challenge Bank"** or export as a `.json` pack.

### Mode 2: Command Line Agent (`scripts/generate-challenge.mjs`)
You can also generate challenges directly into JSON files in the repo:

```bash
# Interactive mode
npm run generate-challenge

# Or with arguments
node scripts/generate-challenge.mjs --prompt "Ask for a pet name and print '[name] is the best pet!'" --difficulty Beginner
```

The generated `.json` files can be imported into the web app anytime using the **Import** button in the sidebar.

---

## 🌐 Deploying to GitHub Pages

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit of Python Junior Autograder"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to your repository on GitHub:
   - Navigate to **Settings** -> **Pages**
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**
3. The included workflow (`.github/workflows/deploy.yml`) will automatically build and publish your site!
4. Your autograder will be live at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🛠️ Architecture & Extensibility

- **Framework**: React 19 + TypeScript + Vite + Tailwind CSS
- **Code Editor**: CodeMirror 6 (`@uiw/react-codemirror`) with Python language support and responsive font scaling (14px–18px)
- **Execution Sandbox**: Pyodide (Python 3.12 WebAssembly) with `sys.stdin` StringIO mocking for automated test runs and timeout guards (5s infinite-loop protection)
- **Grading Pipeline**: Standard Input/Output comparison with trailing whitespace normalization. Extensible hook architecture ready for future AST / syntax tree checks (`checkCodeStructure`)
- **AI Engine**: Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` with strict JSON schema response formatting

---

## 📄 License
MIT License. Free for schools, educators, and young coders everywhere!
