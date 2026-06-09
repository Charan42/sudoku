import { useEffect, useMemo, useState } from 'react';
import { Digit } from '../lib/types';
import {
  LESSONS,
  Step,
  buildBoard,
  getLesson,
  markLessonCompleted,
} from '../lib/lessons';
import { LessonBoard } from '../components/LessonBoard';

interface LessonPageProps {
  lessonId: string;
}

const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function LessonPage({ lessonId }: LessonPageProps) {
  const lesson = getLesson(lessonId);

  const [stepIndex, setStepIndex] = useState(0);
  const [solved, setSolved] = useState(false); // current interactive step solved
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [wrongCell, setWrongCell] = useState<string | null>(null);
  const [correctCell, setCorrectCell] = useState<string | null>(null);
  const [wrongDigit, setWrongDigit] = useState<Digit | null>(null);
  const [multiSelection, setMultiSelection] = useState<Set<Digit>>(new Set());

  // Reset everything when switching lessons
  useEffect(() => {
    setStepIndex(0);
    setSolved(false);
    setFinished(false);
    setFeedback(null);
    setShowHint(false);
    setWrongCell(null);
    setCorrectCell(null);
    setWrongDigit(null);
    setMultiSelection(new Set());
    window.scrollTo(0, 0);
  }, [lessonId]);

  useEffect(() => {
    if (finished && lesson) markLessonCompleted(lesson.id);
  }, [finished, lesson]);

  const givens = useMemo(
    () => (lesson ? buildBoard(lesson.givens) : buildBoard([])),
    [lesson]
  );

  // Digits placed on the board so far: reveals from reached info steps and
  // answers from completed pick-digit steps.
  const placed = useMemo(() => {
    const map = new Map<string, Digit>();
    if (!lesson) return map;
    lesson.steps.forEach((step, i) => {
      const reached = i < stepIndex || (i === stepIndex && (step.kind === 'info' || solved));
      if (!reached) return;
      if (step.kind === 'info' && step.reveal) {
        for (const [r, c, d] of step.reveal) map.set(`${r},${c}`, d);
      }
      if (step.kind === 'pick-digit') {
        map.set(`${step.cell[0]},${step.cell[1]}`, step.answer);
      }
    });
    return map;
  }, [lesson, stepIndex, solved]);

  if (!lesson) {
    return (
      <div className="tutorial">
        <div className="lesson__notfound">
          <h2>Lesson not found</h2>
          <a className="btn btn--primary" href="#/">
            Back to all techniques
          </a>
        </div>
      </div>
    );
  }

  const lessonIndex = LESSONS.findIndex(l => l.id === lesson.id);
  const nextLesson = LESSONS[lessonIndex + 1];
  const step: Step = lesson.steps[Math.min(stepIndex, lesson.steps.length - 1)];
  const isInteractive = step.kind !== 'info';
  const canContinue = !isInteractive || solved;

  const resetStepState = () => {
    setSolved(false);
    setFeedback(null);
    setShowHint(false);
    setWrongCell(null);
    setCorrectCell(null);
    setWrongDigit(null);
    setMultiSelection(new Set());
  };

  const goNext = () => {
    if (stepIndex + 1 >= lesson.steps.length) {
      setFinished(true);
    } else {
      setStepIndex(stepIndex + 1);
      resetStepState();
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex(stepIndex - 1);
    resetStepState();
    // Steps already passed count as solved so their board effects persist.
    setSolved(true);
  };

  const handleCellClick = (r: number, c: number) => {
    if (step.kind !== 'find-cell' || solved) return;
    const key = `${r},${c}`;
    if (step.target[0] === r && step.target[1] === c) {
      setSolved(true);
      setCorrectCell(key);
      setFeedback(step.success);
      setWrongCell(null);
    } else {
      setWrongCell(key);
      setFeedback('Not quite — try again. Need a nudge? Use the hint.');
      window.setTimeout(() => setWrongCell(w => (w === key ? null : w)), 500);
    }
  };

  const handleDigit = (d: Digit) => {
    if (solved) return;
    if (step.kind === 'pick-digit') {
      if (d === step.answer) {
        setSolved(true);
        setFeedback(step.success);
        setWrongDigit(null);
      } else {
        setWrongDigit(d);
        setFeedback(`${d} doesn’t work here — look again, or use the hint.`);
        window.setTimeout(() => setWrongDigit(w => (w === d ? null : w)), 500);
      }
    } else if (step.kind === 'pick-digits') {
      const next = new Set(multiSelection);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      setMultiSelection(next);
      setFeedback(null);
    }
  };

  const handleCheckMulti = () => {
    if (step.kind !== 'pick-digits' || solved) return;
    const want = new Set(step.answers);
    const ok =
      multiSelection.size === want.size && [...multiSelection].every(d => want.has(d));
    if (ok) {
      setSolved(true);
      setFeedback(step.success);
    } else {
      setFeedback(
        multiSelection.size === 0
          ? 'Select the candidate digits first, then press Check.'
          : 'Not exactly — compare your selection against the row and column eliminations.'
      );
    }
  };

  // Board interaction props per step kind
  const showTarget =
    (step.kind === 'pick-digit' && !solved) || (step.kind === 'pick-digits' && !solved)
      ? step.cell
      : null;
  const clickable = step.kind === 'find-cell' && !solved;
  const stepNotes = step.notes?.filter(
    n => !placed.has(`${n.cell[0]},${n.cell[1]}`)
  );

  if (finished) {
    return (
      <div className="tutorial">
        <TopBar title={lesson.title} index={lessonIndex} />
        <div className="lesson__complete">
          <div className="lesson__complete-icon">🎓</div>
          <h2 className="lesson__complete-title">Technique learned!</h2>
          <p className="lesson__complete-text">
            You’ve mastered <strong>{lesson.title}</strong>. {lesson.summary}
          </p>
          <div className="lesson__complete-actions">
            {nextLesson ? (
              <a className="btn btn--primary" href={`#/learn/${nextLesson.id}`}>
                Next: {nextLesson.title} →
              </a>
            ) : (
              <a className="btn btn--primary" href="#/game">
                Play a real game →
              </a>
            )}
            <a className="btn btn--ghost" href="#/">
              All techniques
            </a>
            {nextLesson && (
              <a className="btn btn--ghost" href="#/game">
                Play Sudoku
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tutorial">
      <TopBar title={lesson.title} index={lessonIndex} />

      <div className="lesson">
        <div className="lesson__board-wrap">
          <LessonBoard
            givens={givens}
            placed={placed}
            highlight={step.highlight}
            notes={stepNotes}
            targetCell={showTarget}
            wrongCell={wrongCell}
            correctCell={correctCell}
            clickable={clickable}
            onCellClick={handleCellClick}
          />
        </div>

        <div className="lesson__panel">
          <div className="lesson__dots" aria-label={`Step ${stepIndex + 1} of ${lesson.steps.length}`}>
            {lesson.steps.map((_, i) => (
              <span
                key={i}
                className={`lesson__dot${
                  i < stepIndex ? ' lesson__dot--done' : i === stepIndex ? ' lesson__dot--active' : ''
                }`}
              />
            ))}
          </div>

          <p className="lesson__text">{step.text}</p>

          {step.kind === 'find-cell' && !solved && (
            <p className="lesson__prompt">👆 Tap a cell on the board</p>
          )}

          {(step.kind === 'pick-digit' || step.kind === 'pick-digits') && (
            <div className="lesson__pad" role="group" aria-label="Pick a digit">
              {DIGITS.map(d => {
                const sel = step.kind === 'pick-digits' && multiSelection.has(d);
                const isAnswer =
                  solved &&
                  (step.kind === 'pick-digit'
                    ? d === step.answer
                    : step.answers.includes(d));
                return (
                  <button
                    key={d}
                    className={[
                      'lesson__pad-btn',
                      sel ? 'lesson__pad-btn--selected' : '',
                      isAnswer ? 'lesson__pad-btn--answer' : '',
                      wrongDigit === d ? 'lesson__pad-btn--wrong' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleDigit(d)}
                    disabled={solved}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {step.kind === 'pick-digits' && !solved && (
            <button className="btn btn--primary lesson__check" onClick={handleCheckMulti}>
              Check
            </button>
          )}

          {feedback && (
            <p className={`lesson__feedback${solved ? ' lesson__feedback--success' : ' lesson__feedback--error'}`}>
              {feedback}
            </p>
          )}

          {isInteractive && !solved && (
            <div className="lesson__hint-row">
              {showHint ? (
                <p className="lesson__hint">💡 {step.hint}</p>
              ) : (
                <button className="btn btn--ghost btn--small" onClick={() => setShowHint(true)}>
                  💡 Hint
                </button>
              )}
            </div>
          )}

          <div className="lesson__nav">
            <button
              className="btn btn--ghost"
              onClick={goBack}
              disabled={stepIndex === 0}
            >
              ← Back
            </button>
            <button
              className="btn btn--primary"
              onClick={goNext}
              disabled={!canContinue}
              title={canContinue ? undefined : 'Solve this step to continue'}
            >
              {stepIndex + 1 >= lesson.steps.length ? 'Finish ✓' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, index }: { title: string; index: number }) {
  return (
    <div className="tutorial__topbar">
      <a className="tutorial__back" href="#/">
        ← All techniques
      </a>
      <span className="tutorial__topbar-title">
        <span className="tutorial__topbar-num">{index + 1}</span> {title}
      </span>
      <a className="tutorial__play-link" href="#/game">
        Play ▶
      </a>
    </div>
  );
}
