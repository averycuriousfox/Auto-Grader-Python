import React from 'react';
import { Sparkles, BookOpen, Upload, Rocket } from 'lucide-react';

interface EmptyStateProps {
  onOpenTeacherStudio: () => void;
  onLoadSamples: () => void;
  onImportClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onOpenTeacherStudio,
  onLoadSamples,
  onImportClick,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner mb-4">
          🐍
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Welcome, Young Coders & Teachers!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          Your challenge bank is fresh and ready. Generate your own custom Python exercises from plain English using the AI Agent, or load quick sample challenges.
        </p>

        <div className="space-y-3">
          {/* Primary Action */}
          <button
            onClick={onOpenTeacherStudio}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-100 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Open Teacher AI Studio</span>
          </button>

          {/* Quick Load Samples */}
          <button
            onClick={onLoadSamples}
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2"
          >
            <Rocket className="w-4 h-4 text-amber-600" />
            <span>Load 3 Starter Sample Challenges</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={onImportClick}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON Challenge Pack</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-4 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pyodide WASM</span>
          </span>
          <span>•</span>
          <span>100% Client-Side</span>
          <span>•</span>
          <span>Kid-Friendly Error Tips</span>
        </div>
      </div>
    </div>
  );
};
