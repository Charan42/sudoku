import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Header } from '../components/Header';
import { Grid } from '../components/Grid';
import { NumberPad } from '../components/NumberPad';
import { Controls } from '../components/Controls';
import { Digit } from '../lib/types';

export function GamePage() {
  const {
    state,
    errorCells,
    peerKeys,
    sameValueKeys,
    newGame,
    input,
    select,
    undo,
    redo,
    hint,
    toggleNotes,
    togglePause,
    toggleTheme,
    shareUrl,
    timerFormatted,
  } = useGame();

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
  }, [state.theme]);

  const handleShare = () => {
    const url = shareUrl();
    // Update the browser URL so clipboard copy in Controls picks it up
    window.history.replaceState(null, '', url);
  };

  return (
    <div className="app">
      <nav className="game-nav">
        <a className="game-nav__link" href="#/">
          ← Learn techniques
        </a>
      </nav>

      <Header
        difficulty={state.difficulty}
        mistakes={state.mistakes}
        maxMistakes={state.maxMistakes}
        timerFormatted={timerFormatted}
        isPaused={state.isPaused}
        theme={state.theme}
        onTogglePause={togglePause}
        onToggleTheme={toggleTheme}
      />

      <main className="app__main">
        <Grid
          cells={state.cells}
          selected={state.selected}
          errorCells={errorCells}
          peerKeys={peerKeys}
          sameValueKeys={sameValueKeys}
          isPaused={state.isPaused}
          onSelect={select}
          onInput={(d: Digit | null) => input(d)}
          onToggleNotes={toggleNotes}
          onUndo={undo}
          onRedo={redo}
        />

        <NumberPad
          notesMode={state.notesMode}
          onInput={(d: Digit | null) => input(d)}
          onToggleNotes={toggleNotes}
        />

        <Controls
          difficulty={state.difficulty}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          generating={state.generating}
          onNewGame={newGame}
          onUndo={undo}
          onRedo={redo}
          onHint={hint}
          onShare={handleShare}
        />
      </main>

      {state.isGameOver && (
        <div className="overlay overlay--game-over" role="dialog" aria-label="Game over">
          <div className="overlay__card">
            <div className="overlay__icon">💀</div>
            <h2 className="overlay__title">Game Over</h2>
            <p className="overlay__message">Too many mistakes!</p>
            <button
              className="overlay__btn"
              onClick={() => newGame(state.difficulty)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {state.isComplete && (
        <div className="overlay overlay--complete" role="dialog" aria-label="Puzzle complete">
          <div className="overlay__card">
            <div className="overlay__icon">🎉</div>
            <h2 className="overlay__title">You Win!</h2>
            <p className="overlay__message">Congratulations! Puzzle solved!</p>
            <button
              className="overlay__btn"
              onClick={() => newGame(state.difficulty)}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
