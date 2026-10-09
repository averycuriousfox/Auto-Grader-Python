import React, { useState } from 'react';
import { GradingReport, SingleTestResult } from '../types/challenge';
import { ExecutionResult } from '../services/pyodideRunner';
import { CheckCircle2, XCircle, Terminal, HelpCircle, ChevronDown, ChevronRight, Award, AlertTriangle } from 'lucide-react';

interface GradingDrawerProps {
  gradingReport: GradingReport | null;
  manualRunResult: ExecutionResult | null;
  customInput: string;
  setCustomInput: (val: string) => void;
  activeTab: 'grading' | 'console';
  setActiveTab: (tab: 'grading' | 'console') => void;
}

export const GradingDrawer: React.FC<GradingDrawerProps> = ({
  gradingReport,
  manualRunResult,
  customInput,
  setCustomInput,
  activeTab,
  setActiveTab,
}) => {
  const [selectedTestIdx, setSelectedTestIdx] = useState<number>(0);
  const [showRawError, setShowRawError] = useState<boolean>(false);

  return (
    <div className="h-64 sm:h-72 bg-slate-900 border-t border-slate-700 flex flex-col text-slate-200">
      {/* Drawer Header Tabs */}
      <div className="bg-slate-800/90 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('grading')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'grading'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Grading Report</span>
            {gradingReport && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  gradingReport.allPassed ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'
                }`}
              >
                {gradingReport.passedTests}/{gradingReport.totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'console'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Run</span>
          </button>
        </div>

        {activeTab === 'grading' && gradingReport && (
          <div className="text-xs font-bold">
            {gradingReport.allPassed ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>All Tests Passed! 🎉</span>
              </span>
            ) : (
              <span className="text-rose-400 flex items-center space-x-1">
                <XCircle className="w-4 h-4" />
                <span>
                  {gradingReport.passedTests} of {gradingReport.totalTests} Passed
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
        {activeTab === 'grading' ? (
          !gradingReport ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
              <Award className="w-8 h-8 text-slate-600 mb-1" />
              <p className="font-semibold text-slate-400">No grading results yet</p>
              <p className="text-[11px]">
                Click <span className="text-amber-400 font-bold">"Submit & Grade ⭐"</span> to test your code!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Congratulatory Banner */}
              {gradingReport.allPassed && (
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center space-x-3 text-emerald-200">
                  <div className="text-2xl">🌟</div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">Fantastic Work! You cracked it!</h4>
                    <p className="text-xs text-emerald-400/90 font-sans">
                      All test cases produced the expected output. 3 stars awarded!
                    </p>
                  </div>
                </div>
              )}

              {/* Test Case Selectors */}
              <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                {gradingReport.results.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTestIdx(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                      selectedTestIdx === idx
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span>{r.testCase.name || `Test ${idx + 1}`}</span>
                  </button>
                ))}
              </div>

              {/* Selected Test Details */}
              {gradingReport.results[selectedTestIdx] && (
                <TestDetailView
                  result={gradingReport.results[selectedTestIdx]}
                  showRawError={showRawError}
                  setShowRawError={setShowRawError}
                />
              )}
            </div>
          )
        ) : (
          /* Manual Run / Interactive Tab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>Standard Input (provided to input())</span>
                <span className="text-[10px] text-slate-500">Lines passed sequentially</span>
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input here (each line will be fed to an input() call)..."
                className="w-full flex-1 min-h-[90px] bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400">Program Output (Console)</span>
                {manualRunResult && (
                  <span className="text-[10px] text-slate-500">
                    {manualRunResult.executionTimeMs}ms
                  </span>
                )}
              </div>
              <div className="w-full flex-1 min-h-[90px] bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono overflow-auto">
                {!manualRunResult ? (
                  <span className="text-slate-600">Output will appear here when you click "Run Code"...</span>
                ) : manualRunResult.error ? (
                  <div className="space-y-2">
                    {manualRunResult.friendlyError && (
                      <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-2.5 text-rose-200">
                        <div className="font-bold flex items-center space-x-1.5 text-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{manualRunResult.friendlyError.title}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-rose-200/90 font-sans">
                          {manualRunResult.friendlyError.advice}
                        </p>
                        <p className="mt-1 text-[11px] text-amber-300 font-sans">
                          💡 {manualRunResult.friendlyError.hint}
                        </p>
                      </div>
                    )}
                    <pre className="text-rose-400 text-[11px] whitespace-pre-wrap">
                      {manualRunResult.error}
                    </pre>
                  </div>
                ) : (
                  <pre className="text-emerald-300 whitespace-pre-wrap">
                    {manualRunResult.stdout || '<No output printed>'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TestDetailViewProps {
  result: SingleTestResult;
  showRawError: boolean;
  setShowRawError: (val: boolean) => void;
}

const TestDetailView: React.FC<TestDetailViewProps> = ({
  result,
  showRawError,
  setShowRawError,
}) => {
  return (
    <div className="space-y-3">
      {/* Friendly Error Box if failed */}
      {!result.passed && result.error && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 text-amber-200">
          <div className="flex items-center space-x-2 font-bold text-amber-300 text-xs">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Friendly Tip from Code Helper</span>
          </div>
          <p className="mt-1.5 text-xs text-amber-100 font-sans leading-relaxed">
            {result.friendlyError || 'Review your code and check the expected output below.'}
          </p>

          <button
            onClick={() => setShowRawError(!showRawError)}
            className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-bold underline"
          >
            <span>{showRawError ? 'Hide technical Python error' : 'Show technical Python error'}</span>
            {showRawError ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {showRawError && (
            <pre className="mt-2 p-2 bg-slate-950 rounded-lg text-rose-300 text-[10px] overflow-x-auto border border-rose-950">
              {result.error}
            </pre>
          )}
        </div>
      )}

      {/* Grid of Input, Expected, Actual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Input */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
            Input Provided
          </span>
          <pre className="text-slate-300 text-[11px] whitespace-pre-wrap">
            {result.testCase.input !== '' ? result.testCase.input : '<No input needed>'}
          </pre>
        </div>

        {/* Expected Output */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-emerald-400 block mb-1 uppercase tracking-wider">
            Expected Output
          </span>
          <pre className="text-emerald-300 text-[11px] whitespace-pre-wrap">
            {result.expectedOutput !== '' ? result.expectedOutput : '<No output expected>'}
          </pre>
        </div>

        {/* Your Output */}
        <div
          className={`p-2.5 rounded-xl border ${
            result.passed
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : 'bg-rose-950/30 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                result.passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Your Code's Output
            </span>
            <span className="text-[10px] text-slate-500">{result.executionTimeMs}ms</span>
          </div>
          <pre
            className={`text-[11px] whitespace-pre-wrap ${
              result.passed ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {result.actualOutput !== '' ? result.actualOutput : '<No output printed>'}
          </pre>
        </div>
      </div>
    </div>
  );
};
