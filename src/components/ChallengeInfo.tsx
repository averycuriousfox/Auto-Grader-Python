import React, { useState } from 'react';
import { Challenge } from '../types/challenge';
import { Lightbulb, ChevronDown, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

interface ChallengeInfoProps {
  challenge: Challenge;
  fontSize: number;
}

export const ChallengeInfo: React.FC<ChallengeInfoProps> = ({ challenge, fontSize }) => {
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((i) => i !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-5 bg-white border-r border-slate-200">
      {/* Header Tag */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
          {challenge.category || 'Python Quest'}
        </span>
        <span className="text-xs font-bold text-slate-500">
          Difficulty: {challenge.difficulty}
        </span>
      </div>

      <h2
        className="font-extrabold text-slate-900 tracking-tight mb-4"
        style={{ fontSize: `${fontSize + 6}px` }}
      >
        {challenge.title}
      </h2>

      {/* Description Content */}
      <div
        className="prose prose-slate max-w-none mb-8 text-slate-700 leading-relaxed font-sans"
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Render markdown-like sections cleanly */}
        {challenge.description.split('\n\n').map((paragraph, idx) => {
          // Blockquotes
          if (paragraph.startsWith('>')) {
            return (
              <div
                key={idx}
                className="bg-amber-50/80 border-l-4 border-amber-400 p-3.5 my-3 rounded-r-xl text-amber-900 text-sm font-medium"
              >
                {paragraph.replace(/^>\s*/gm, '')}
              </div>
            );
          }
          // Code blocks
          if (paragraph.startsWith('```')) {
            const cleanCode = paragraph.replace(/```[a-z]*\n?/g, '').trim();
            return (
              <pre
                key={idx}
                className="bg-slate-900 text-amber-300 p-3.5 rounded-xl font-mono text-xs my-3 overflow-x-auto border border-slate-800"
              >
                <code>{cleanCode}</code>
              </pre>
            );
          }
          // Headings
          if (paragraph.startsWith('###')) {
            return (
              <h3 key={idx} className="font-extrabold text-slate-800 text-base mt-4 mb-2 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>{paragraph.replace(/^###\s*/, '')}</span>
              </h3>
            );
          }
          if (paragraph.startsWith('####')) {
            return (
              <h4 key={idx} className="font-bold text-slate-800 text-sm mt-3 mb-1.5 text-blue-900">
                {paragraph.replace(/^####\s*/, '')}
              </h4>
            );
          }
          // Normal paragraphs
          return (
            <p key={idx} className="my-2 whitespace-pre-wrap">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Hints Accordion */}
      {challenge.hints && challenge.hints.length > 0 && (
        <div className="border-t border-slate-200 pt-5 mt-6">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-300" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Need a Gentle Hint?
            </h3>
          </div>

          <div className="space-y-2">
            {challenge.hints.map((hint, index) => {
              const isRevealed = revealedHints.includes(index);
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleHint(index)}
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition text-xs font-bold text-slate-700"
                  >
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hint {index + 1}</span>
                    </span>
                    {isRevealed ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isRevealed && (
                    <div className="px-4 py-3 bg-amber-50/50 text-slate-800 text-xs sm:text-sm font-medium border-t border-slate-100">
                      {hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
