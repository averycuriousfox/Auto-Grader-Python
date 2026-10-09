import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Challenge, GradingReport } from './types/challenge';
import {
  getStoredChallenges,
  saveChallenges,
  addChallenge,
  deleteChallenge,
  getStudentProgress,
  markChallengeCompleted,
  saveStudentCodeDraft,
  getStudentCodeDraft,
  resetStudentProgress,
  getStoredFontSize,
  saveStoredFontSize,
  exportChallengesAsJSON,
} from './services/storage';
import {
  getPyodideInstance,
  runPythonCode,
  gradeStudentSubmission,
  ExecutionResult,
} from './services/pyodideRunner';
import { SAMPLE_CHALLENGES } from './data/samplePack';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChallengeInfo } from './components/ChallengeInfo';
import { EditorPane } from './components/EditorPane';
import { GradingDrawer } from './components/GradingDrawer';
import { TeacherStudioModal } from './components/TeacherStudioModal';
import { EmptyState } from './components/EmptyState';

export function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState(getStudentProgress());
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSizeState] = useState<number>(getStoredFontSize());
  const [pyodideStatus, setPyodideStatus] = useState<string>('Initializing...');
  const [isPyodideReady, setIsPyodideReady] = useState<boolean>(false);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingReport, setGradingReport] = useState<GradingReport | null>(null);
  const [manualRunResult, setManualRunResult] = useState<ExecutionResult | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [activeDrawerTab, setActiveDrawerTab] = useState<'grading' | 'console'>('grading');

  // Modal state
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState<boolean>(false);
  const hiddenImportRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load & Pyodide Warmup
  useEffect(() => {
    const stored = getStoredChallenges();
    setChallenges(stored);
    if (stored.length > 0) {
      setActiveChallengeId(stored[0].id);
      const draft = getStudentCodeDraft(stored[0].id, stored[0].starterCode);
      setCode(draft);
      if (stored[0].testCases[0]) {
        setCustomInput(stored[0].testCases[0].input || '');
      }
    }

    // Warm up Pyodide in background
    getPyodideInstance((msg) => setPyodideStatus(msg))
      .then(() => {
        setIsPyodideReady(true);
        setPyodideStatus('Ready');
      })
      .catch((err) => {
        console.error('Pyodide failed to warm up', err);
        setPyodideStatus('Error loading Python');
      });
  }, []);

  // 2. Active Challenge Change
  const handleSelectChallenge = (id: string) => {
    setActiveChallengeId(id);
    const target = challenges.find((c) => c.id === id);
    if (target) {
      const draft = getStudentCodeDraft(target.id, target.starterCode);
      setCode(draft);
      setGradingReport(null);
      setManualRunResult(null);
      if (target.testCases[0]) {
        setCustomInput(target.testCases[0].input || '');
      }
    }
  };

  // 3. Code change handler (auto-saves draft)
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeChallengeId) {
      saveStudentCodeDraft(activeChallengeId, newCode);
    }
  };

  // 4. Reset Code
  const handleResetCode = () => {
    const current = challenges.find((c) => c.id === activeChallengeId);
    if (!current) return;
    if (confirm('Reset your code back to the starter template?')) {
      setCode(current.starterCode);
      saveStudentCodeDraft(current.id, current.starterCode);
    }
  };

  // 5. Run Code Once (Interactive manual test)
  const handleRunOnce = async () => {
    if (!isPyodideReady) {
      alert('Python engine is still warming up. Please wait a moment...');
      return;
    }
    setIsRunning(true);
    setActiveDrawerTab('console');

    try {
      const res = await runPythonCode({
        code,
        input: customInput,
        timeoutMs: 5000,
      });
      setManualRunResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  // 6. Submit & Grade
  const handleGrade = async () => {
    const current = challenges.find((c) => c.id === activeChallengeId);
    if (!current) return;

    if (!isPyodideReady) {
      alert('Python engine is still warming up. Please wait a moment...');
      return;
    }

    setIsGrading(true);
    setActiveDrawerTab('grading');

    try {
      const report = await gradeStudentSubmission(
        current.id,
        code,
        current.testCases,
        (currentIdx, total) => {
          setPyodideStatus(`Grading test ${currentIdx}/${total}...`);
        }
      );

      setGradingReport(report);
      setPyodideStatus('Ready');

      if (report.allPassed) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
        });

        // Award stars and update progress
        const updatedProgress = markChallengeCompleted(current.id);
        setStudentProgress(updatedProgress);
      }
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  // 7. Add Challenge
  const handleAddChallenge = (newChallenge: Challenge) => {
    const updated = addChallenge(newChallenge);
    setChallenges(updated);
    setActiveChallengeId(newChallenge.id);
    setCode(newChallenge.starterCode);
    if (newChallenge.testCases[0]) {
      setCustomInput(newChallenge.testCases[0].input || '');
    }
  };

  // 8. Delete Challenge
  const handleDeleteChallenge = (id: string) => {
    const updated = deleteChallenge(id);
    setChallenges(updated);
    if (activeChallengeId === id) {
      if (updated.length > 0) {
        handleSelectChallenge(updated[0].id);
      } else {
        setActiveChallengeId(null);
        setCode('');
      }
    }
  };

  // 9. Load Sample Pack
  const handleLoadSamples = () => {
    saveChallenges(SAMPLE_CHALLENGES);
    setChallenges(SAMPLE_CHALLENGES);
    setActiveChallengeId(SAMPLE_CHALLENGES[0].id);
    setCode(SAMPLE_CHALLENGES[0].starterCode);
    setCustomInput(SAMPLE_CHALLENGES[0].testCases[0]?.input || '');
  };

  // 10. Import JSON
  const handleImportPack = (imported: Challenge[]) => {
    const current = getStoredChallenges();
    const combined = [...imported, ...current.filter((c) => !imported.some((imp) => imp.id === c.id))];
    saveChallenges(combined);
    setChallenges(combined);
    if (combined.length > 0) {
      handleSelectChallenge(combined[0].id);
    }
  };

  // 11. Reset Progress
  const handleResetProgress = () => {
    if (confirm('Reset your star score and drafts? Your challenges will stay intact.')) {
      const refreshed = resetStudentProgress();
      setStudentProgress(refreshed);
      setGradingReport(null);
      setManualRunResult(null);
      const current = challenges.find((c) => c.id === activeChallengeId);
      if (current) {
        setCode(current.starterCode);
      }
    }
  };

  // 12. Font size setter
  const setFontSize = (size: number) => {
    setFontSizeState(size);
    saveStoredFontSize(size);
  };

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Header */}
      <Header
        stars={studentProgress.stars}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenTeacherStudio={() => setIsTeacherStudioOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          challenges={challenges}
          activeChallengeId={activeChallengeId}
          onSelectChallenge={handleSelectChallenge}
          completedIds={studentProgress.completedChallengeIds}
          onOpenTeacherStudio={() => setIsTeacherStudioOpen(true)}
          onExportPack={() => exportChallengesAsJSON(challenges)}
          onImportPack={handleImportPack}
          onDeleteChallenge={handleDeleteChallenge}
        />

        {/* Center / Right Content */}
        {challenges.length === 0 || !activeChallenge ? (
          <EmptyState
            onOpenTeacherStudio={() => setIsTeacherStudioOpen(true)}
            onLoadSamples={handleLoadSamples}
            onImportClick={() => hiddenImportRef.current?.click()}
          />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Challenge Description Pane */}
            <div className="w-full lg:w-5/12 h-1/2 lg:h-full overflow-hidden border-b lg:border-b-0 border-slate-200">
              <ChallengeInfo challenge={activeChallenge} fontSize={fontSize} />
            </div>

            {/* Code Editor and Grading Drawer Pane */}
            <div className="w-full lg:w-7/12 h-1/2 lg:h-full flex flex-col overflow-hidden">
              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                <EditorPane
                  code={code}
                  onChange={handleCodeChange}
                  onRunOnce={handleRunOnce}
                  onGrade={handleGrade}
                  onResetCode={handleResetCode}
                  isRunning={isRunning}
                  isGrading={isGrading}
                  fontSize={fontSize}
                  pyodideStatus={pyodideStatus}
                />
              </div>

              {/* Bottom Test & Console Drawer */}
              <GradingDrawer
                gradingReport={gradingReport}
                manualRunResult={manualRunResult}
                customInput={customInput}
                setCustomInput={setCustomInput}
                activeTab={activeDrawerTab}
                setActiveTab={setActiveDrawerTab}
              />
            </div>
          </div>
        )}
      </div>

      {/* Teacher AI Studio Modal */}
      <TeacherStudioModal
        isOpen={isTeacherStudioOpen}
        onClose={() => setIsTeacherStudioOpen(false)}
        onAddChallenge={handleAddChallenge}
      />

      {/* Hidden file input for import */}
      <input
        ref={hiddenImportRef}
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parsed = JSON.parse(event.target?.result as string);
              const list = Array.isArray(parsed) ? parsed : [parsed];
              handleImportPack(list);
            } catch (err) {
              alert('Could not read JSON file. Please check file formatting.');
            }
          };
          reader.readAsText(file);
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
}

export default App;
