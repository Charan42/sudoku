import { Difficulty } from '../lib/types';

interface ControlsProps {
  difficulty: Difficulty;
  canUndo: boolean;
  canRedo: boolean;
  generating: boolean;
  onNewGame: (d: Difficulty) => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onShare: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export function Controls({
  difficulty,
  canUndo,
  canRedo,
  generating,
  onNewGame,
  onUndo,
  onRedo,
  onHint,
  onShare,
}: ControlsProps) {
  const handleShare = async () => {
    onShare();
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard not available, URL already set
    }
  };

  return (
    <div className="controls">
      <div className="controls__difficulties">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            className={`controls__diff-btn${d === difficulty ? ' controls__diff-btn--active' : ''}`}
            onClick={() => onNewGame(d)}
            disabled={generating}
            aria-pressed={d === difficulty}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      <div className="controls__actions">
        <button
          className="controls__action-btn controls__new-game"
          onClick={() => onNewGame(difficulty)}
          disabled={generating}
          aria-label="New game"
        >
          {generating ? '...' : 'New Game'}
        </button>
        <button
          className="controls__action-btn"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo (Ctrl+Z)"
        >
          ↩ Undo
        </button>
        <button
          className="controls__action-btn"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↪ Redo
        </button>
        <button
          className="controls__action-btn controls__hint"
          onClick={onHint}
          aria-label="Hint"
          title="Get a hint"
        >
          💡 Hint
        </button>
        <button
          className="controls__action-btn controls__share"
          onClick={handleShare}
          aria-label="Share puzzle"
          title="Copy share link"
        >
          🔗 Share
        </button>
      </div>
    </div>
  );
}
