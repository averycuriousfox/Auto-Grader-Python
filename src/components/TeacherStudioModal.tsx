import React, { useState, useEffect } from 'react';
import { Challenge } from '../types/challenge';
import { generateChallengeFromPrompt, GenerationResult } from '../services/geminiGenerator';
import { getStoredGeminiKey, saveStoredGeminiKey } from '../services/storage';
import { Sparkles, X, Key, AlertCircle, Loader2, ShieldCheck, Download, Plus } from 'lucide-react';

interface TeacherStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChallenge: (challenge: Challenge) => void;
}

export const TeacherStudioModal: React.FC<TeacherStudioModalProps> = ({
  isOpen,
  onClose,
  onAddChallenge,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [numTests, setNumTests] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiKey());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setErrorMsg('Please enter your Gemini API key. You can get a free key from Google AI Studio.');
      return;
    }
    if (!promptText.trim()) {
      setErrorMsg('Please enter a natural language question or description for the challenge.');
      return;
    }

    saveStoredGeminiKey(apiKey);
    setErrorMsg(null);
    setIsGenerating(true);
    setResult(null);

    try {
      const genResult = await generateChallengeFromPrompt({
        apiKey: apiKey.trim(),
        teacherPrompt: promptText.trim(),
        difficulty,
        numTestCases: numTests,
      });
      setResult(genResult);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate challenge. Please check your API key and prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBank = () => {
    if (!result?.challenge) return;
    onAddChallenge(result.challenge);
    onClose();
  };

  const handleExportJSON = () => {
    if (!result?.challenge) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result.challenge, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${result.challenge.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Teacher AI Studio
              </h2>
              <p className="text-xs text-blue-100">
                Transform any natural language problem into a junior-ready challenge with automated test cases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* API Key Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
              >
                Get a free key at Google AI Studio ↗
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your AI Studio API key here (saved locally in your browser only)..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Natural Language Prompt Box */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Describe Your Coding Challenge in Plain English
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Ask the student for two numbers using input(), calculate their sum, and print 'The sum is [total]'. Also test with negative numbers and zero."
              className="w-full bg-white border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none font-sans"
            />
            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-bold">Quick ideas:</span>
              <button
                onClick={() =>
                  setPromptText(
                    'Ask the student for their name and year of birth. Calculate their age assuming the current year is 2026, and print: [Name], you are [Age] years old!'
                  )
                }
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg transition"
              >
                Age Calculator
              </button>
              <button
                onClick={() =>
                  setPromptText(
                    'Read an exam score from 0 to 100. If the score is 80 or above, print "Great job! High pass". Otherwise, print "Keep practicing!".'
                  )
                }
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg transition"
              >
                Pass/Fail Grade
              </button>
              <button
                onClick={() =>
                  setPromptText(
                    'Ask for a secret word. If the word is "python", print "Access Granted! 🔓". If not, print "Access Denied! 🔒".'
                  )
                }
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg transition"
              >
                Secret Password
              </button>
            </div>
          </div>

          {/* Controls row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="Beginner">Beginner (Ages 7-9, Print & Input)</option>
                <option value="Intermediate">Intermediate (Ages 9-11, Math & If-Else)</option>
                <option value="Advanced">Advanced (Ages 11-12, Loops & Lists)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Number of Test Cases
              </label>
              <select
                value={numTests}
                onChange={(e) => setNumTests(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value={2}>2 Test Cases</option>
                <option value={3}>3 Test Cases (Standard)</option>
                <option value={4}>4 Test Cases (Includes edge case)</option>
                <option value={5}>5 Test Cases (Comprehensive)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-100 transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini 3.8 Flash is crafting challenges & test cases...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Challenge & Verify with Pyodide</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {result && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                    {result.challenge.category}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {result.challenge.title}
                  </h3>
                </div>

                {/* Pyodide Verification Badge */}
                {result.verifiedWithPyodide ? (
                  <div className="flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified with Pyodide WASM (100% Pass)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Reference Solution needs review</span>
                  </div>
                )}
              </div>

              {/* Description preview */}
              <div className="text-xs text-slate-700 whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-slate-200">
                {result.challenge.description}
              </div>

              {/* Reference Solution Code */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Reference Solution (Python)
                </span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>{result.challenge.solutionCode}</code>
                </pre>
              </div>

              {/* Test Cases Table */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Generated Test Cases ({result.challenge.testCases.length})
                </span>
                <div className="space-y-2">
                  {result.challenge.testCases.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-1 md:grid-cols-2 gap-2"
                    >
                      <div>
                        <span className="font-bold text-slate-700 block mb-0.5">
                          #{idx + 1}: {tc.name}
                        </span>
                        <div className="text-slate-500 text-[11px]">
                          Input:{' '}
                          <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                            {tc.input !== '' ? tc.input : '<No input>'}
                          </code>
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-700 block mb-0.5">
                          Expected Output:
                        </span>
                        <pre className="text-emerald-900 font-mono text-[11px] bg-emerald-50/50 p-1.5 rounded border border-emerald-100 whitespace-pre-wrap">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleSaveToBank}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl shadow-md shadow-emerald-200 transition flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save to Challenge Bank</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm py-2.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
