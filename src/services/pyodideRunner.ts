import { TestCase, SingleTestResult, GradingReport } from '../types/challenge';
import { translatePythonError } from './errorTranslator';

// Declare global Pyodide window object
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodideInstance: any = null;
let initPromise: Promise<any> | null = null;

/**
 * Initializes and caches the Pyodide WebAssembly runtime.
 */
export async function getPyodideInstance(onStatusUpdate?: (status: string) => void): Promise<any> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    onStatusUpdate?.('Loading Python engine (WebAssembly)...');

    // Wait until window.loadPyodide is available from the CDN script tag
    let attempts = 0;
    while (!window.loadPyodide && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.loadPyodide) {
      throw new Error('Pyodide script failed to load from CDN. Please check your internet connection.');
    }

    onStatusUpdate?.('Initializing Python runtime...');
    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });

    // Set up the Python execution wrapper in Pyodide
    const setupScript = `
import sys
import io
import traceback

def __run_junior_code(code_str, input_str):
    old_stdin = sys.stdin
    old_stdout = sys.stdout
    old_stderr = sys.stderr

    stdin_io = io.StringIO(input_str)
    stdout_io = io.StringIO()
    stderr_io = io.StringIO()

    sys.stdin = stdin_io
    sys.stdout = stdout_io
    sys.stderr = stderr_io

    error = None
    try:
        # Isolated global scope
        exec_globals = {
            "__name__": "__main__",
            "__doc__": None,
        }
        exec(code_str, exec_globals)
    except Exception as e:
        error = traceback.format_exc()
    finally:
        sys.stdin = old_stdin
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    return {
        "stdout": stdout_io.getvalue(),
        "stderr": stderr_io.getvalue(),
        "error": error
    }
`;
    await pyodide.runPythonAsync(setupScript);
    pyodideInstance = pyodide;
    onStatusUpdate?.('Python engine ready!');
    return pyodide;
})();

  return initPromise;
}

/**
 * Normalizes output strings for kid-friendly comparison:
 * Trims trailing whitespace from each line and strips trailing newlines.
 */
export function normalizeOutput(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export interface RunSingleOptions {
  code: string;
  input?: string;
  timeoutMs?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  friendlyError?: ReturnType<typeof translatePythonError>;
  executionTimeMs: number;
}

/**
 * Runs a snippet of Python code with the provided standard input.
 */
export async function runPythonCode(options: RunSingleOptions): Promise<ExecutionResult> {
  const { code, input = '', timeoutMs = 5000 } = options;
  const pyodide = await getPyodideInstance();

  const startTime = performance.now();

  // Execute with timeout protection
  const executionPromise = (async () => {
    // Escape string literals safely for Python passing
    const runJuniorCode = pyodide.globals.get('__run_junior_code');
    const pyResult = runJuniorCode(code, input);
    const jsResult = pyResult.toJs({ dict_converter: Object.fromEntries });
    pyResult.destroy();
    return jsResult;
  })();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('TimeoutError: Execution timed out (exceeded 5 seconds).'));
    }, timeoutMs);
  });

  try {
    const rawResult: any = await Promise.race([executionPromise, timeoutPromise]);
    const executionTimeMs = Math.round(performance.now() - startTime);

    const error = rawResult.error || undefined;
    const friendlyError = error ? translatePythonError(error) : undefined;

    return {
      stdout: rawResult.stdout || '',
      stderr: rawResult.stderr || '',
      error,
      friendlyError,
      executionTimeMs,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    const rawError = err?.message || String(err);
    return {
      stdout: '',
      stderr: '',
      error: rawError,
      friendlyError: translatePythonError(rawError),
      executionTimeMs,
    };
  }
}

/**
 * Grade a student's submission against an array of test cases.
 * Built modularly with room for AST/structural checks in the future.
 */
export async function gradeStudentSubmission(
  challengeId: string,
  code: string,
  testCases: TestCase[],
  onProgress?: (current: number, total: number) => void
): Promise<GradingReport> {
  const results: SingleTestResult[] = [];
  let passedCount = 0;
  let firstError: string | undefined;
  let firstFriendlyError: string | undefined;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    onProgress?.(i + 1, testCases.length);

    const exec = await runPythonCode({
      code,
      input: tc.input || '',
      timeoutMs: 5000,
    });

    const normActual = normalizeOutput(exec.stdout);
    const normExpected = normalizeOutput(tc.expectedOutput);

    const passed = !exec.error && normActual === normExpected;
    if (passed) {
      passedCount++;
    } else if (!firstError && exec.error) {
      firstError = exec.error;
      firstFriendlyError = exec.friendlyError?.advice;
    }

    results.push({
      testCase: tc,
      passed,
      actualOutput: exec.stdout,
      expectedOutput: tc.expectedOutput,
      error: exec.error,
      friendlyError: exec.friendlyError?.advice,
      executionTimeMs: exec.executionTimeMs,
    });
  }

  return {
    challengeId,
    allPassed: passedCount === testCases.length && testCases.length > 0,
    totalTests: testCases.length,
    passedTests: passedCount,
    results,
    runtimeError: firstError,
    friendlyError: firstFriendlyError,
    rawTraceback: firstError,
  };
}

/**
 * Placeholder for future AST / Structural checks (e.g. checking for 'for' loops or variable names)
 */
export async function checkCodeStructure(_code: string, _requirements: Record<string, any>): Promise<{ passed: boolean; message?: string }> {
  // Ready for AST check extensions in future releases
  return { passed: true };
}
