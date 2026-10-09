import React, { useRef } from 'react';
import { Challenge } from '../types/challenge';
import { CheckCircle2, Circle, Plus, Download, Upload, Trash2, Award } from 'lucide-react';

interface SidebarProps {
  challenges: Challenge[];
  activeChallengeId: string | null;
  onSelectChallenge: (id: string) => void;
  completedIds: string[];
  onOpenTeacherStudio: () => void;
  onExportPack: () => void;
  onImportPack: (imported: Challenge[]) => void;
  onDeleteChallenge: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  challenges,
  activeChallengeId,
  onSelectChallenge,
  completedIds,
  onOpenTeacherStudio,
  onExportPack,
  onImportPack,
  onDeleteChallenge,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        onImportPack(list);
      } catch (err) {
        alert('Could not read JSON file. Please check file formatting.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Top action bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Challenge Bank</span>
          </h2>
          <span className="text-xs text-slate-500">
            {completedIds.length} of {challenges.length} completed
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenTeacherStudio}
            title="Create challenge with AI"
            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onExportPack}
            disabled={challenges.length === 0}
            title="Export challenge bank as JSON"
            className="p-1.5 hover:bg-slate-100 text-slate-600 disabled:opacity-40 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import challenge pack JSON"
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Challenge List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {challenges.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <p className="text-sm font-bold text-slate-700">No challenges yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Open Teacher AI Studio to generate your first challenges from natural language!
            </p>
            <button
              onClick={onOpenTeacherStudio}
              className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition shadow-sm"
            >
              + Create First Challenge
            </button>
          </div>
        ) : (
          challenges.map((c, index) => {
            const isCompleted = completedIds.includes(c.id);
            const isActive = activeChallengeId === c.id;

            return (
              <div
                key={c.id}
                onClick={() => onSelectChallenge(c.id)}
                className={`group relative p-3.5 rounded-2xl cursor-pointer transition border text-left flex items-start space-x-3 ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {/* Status indicator */}
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      Level {index + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
                        c.difficulty
                      )}`}
                    >
                      {c.difficulty}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-bold truncate mt-0.5 ${
                      isActive ? 'text-blue-900 font-extrabold' : 'text-slate-700'
                    }`}
                  >
                    {c.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[11px] text-slate-500 truncate">
                      {c.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">
                      {c.testCases.length} {c.testCases.length === 1 ? 'test' : 'tests'}
                    </span>
                  </div>
                </div>

                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete challenge "${c.title}"?`)) {
                      onDeleteChallenge(c.id);
                    }
                  }}
                  title="Delete challenge"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
