import { Difficulty } from '../lib/types';

interface HeaderProps {
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  timerFormatted: string;
  isPaused: boolean;
  theme: 'light' | 'dark';
  onTogglePause: () => void;
  onToggleTheme: () => void;
}

export function Header({
  difficulty,
  mistakes,
  maxMistakes,
  timerFormatted,
  isPaused,
  theme,
  onTogglePause,
  onToggleTheme,
}: HeaderProps) {
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">SUDOKU</h1>
        <span className="header__difficulty">{difficultyLabel}</span>
      </div>

      <div className="header__center">
        <button
          className="header__timer-btn"
          onClick={onTogglePause}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          <span className="header__timer-icon">⏱</span>
          <span className="header__timer-text">{isPaused ? 'Paused' : timerFormatted}</span>
          <span className="header__pause-icon">{isPaused ? '▶' : '⏸'}</span>
        </button>
      </div>

      <div className="header__right">
        <div className="header__mistakes" aria-label={`${mistakes} mistakes out of ${maxMistakes}`}>
          {Array.from({ length: maxMistakes }, (_, i) => (
            <span key={i} className={`header__mistake-dot${i < mistakes ? ' header__mistake-dot--used' : ''}`}>
              ●
            </span>
          ))}
        </div>
        <button
          className="header__theme-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
