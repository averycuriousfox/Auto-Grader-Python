import React from 'react';
import { Star, Sparkles, Type, RotateCcw } from 'lucide-react';

interface HeaderProps {
  stars: number;
  fontSize: number;
  setFontSize: (size: number) => void;
  onOpenTeacherStudio: () => void;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  fontSize,
  setFontSize,
  onOpenTeacherStudio,
  onResetProgress,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-md shadow-amber-100 text-2xl">
          🐍
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-lg text-slate-800 tracking-tight">
              Python Junior <span className="text-amber-500">Autograder</span>
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Primary Edition
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Safe in-browser Python grading with WebAssembly & instant friendly hints
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Star Counter */}
        <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full font-extrabold text-sm shadow-sm">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
          <span>{stars} Stars</span>
        </div>

        {/* Font Size Selector for Young Learners */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <Type className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          <button
            onClick={() => setFontSize(14)}
            className={`px-2 py-1 rounded-lg transition ${fontSize === 14 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'hover:text-slate-900'}`}
            title="Regular text (14px)"
          >
            A
          </button>
          <button
            onClick={() => setFontSize(16)}
            className={`px-2 py-1 rounded-lg text-sm transition ${fontSize === 16 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'hover:text-slate-900'}`}
            title="Medium text (16px)"
          >
            A+
          </button>
          <button
            onClick={() => setFontSize(18)}
            className={`px-2 py-1 rounded-lg text-base transition ${fontSize === 18 ? 'bg-white shadow-sm text-blue-600 font-bold' : 'hover:text-slate-900'}`}
            title="Large text (18px)"
          >
            A++
          </button>
        </div>

        {/* Reset Progress */}
        <button
          onClick={onResetProgress}
          title="Reset stars and student code drafts"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Teacher Studio Button */}
        <button
          onClick={onOpenTeacherStudio}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md shadow-blue-200 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Teacher AI Studio</span>
        </button>
      </div>
    </header>
  );
};
