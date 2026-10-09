import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';

interface EditorPaneProps {
  code: string;
  onChange: (val: string) => void;
  onRunOnce: () => void;
  onGrade: () => void;
  onResetCode: () => void;
  isRunning: boolean;
  isGrading: boolean;
  fontSize: number;
  pyodideStatus?: string;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  code,
  onChange,
  onRunOnce,
  onGrade,
  onResetCode,
  isRunning,
  isGrading,
  fontSize,
  pyodideStatus,
}) => {
  const isBusy = isRunning || isGrading;

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden border-b border-slate-700">
      {/* Editor Toolbar */}
      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            solution.py
          </span>
          {pyodideStatus && (
            <span className="text-[11px] text-amber-400/90 font-mono hidden md:inline ml-2">
              ({pyodideStatus})
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetCode}
            disabled={isBusy}
            title="Reset to starter code"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Test Run button */}
          <button
            onClick={onRunOnce}
            disabled={isBusy}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 rounded-xl transition active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            )}
            <span>Run Code</span>
          </button>

          {/* Submit & Grade button */}
          <button
            onClick={onGrade}
            disabled={isBusy}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-900/40 rounded-xl transition active:scale-95 disabled:opacity-50"
          >
            {isGrading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
            <span>Submit & Grade ⭐</span>
          </button>
        </div>
      </div>

      {/* CodeMirror Editor Area */}
      <div className="flex-1 overflow-auto text-left">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[python()]}
          onChange={onChange}
          style={{ fontSize: `${fontSize}px` }}
          className="h-full font-mono"
        />
      </div>
    </div>
  );
};
