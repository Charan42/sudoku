import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { LessonPage } from './pages/LessonPage';

/**
 * Tiny hash-based router (`#/`, `#/game`, `#/learn/:id`).
 * Hash routing is used (instead of path routing) so deep links survive a page
 * refresh on GitHub Pages, where the app is served from a static base path.
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const route = hash.replace(/^#/, '');
  return route === '' ? '/' : route;
}

export default function App() {
  const route = useHashRoute();

  // Apply the saved theme everywhere (the game page keeps managing its own toggle)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sudoku-state');
      if (raw) {
        const theme = (JSON.parse(raw) as { theme?: string }).theme;
        if (theme === 'light' || theme === 'dark') {
          document.documentElement.dataset.theme = theme;
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Legacy shared-puzzle links (?p=...) point at the root: send them to the game.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('p') && route === '/') {
      window.location.hash = '#/game';
    }
  }, [route]);

  // Start each page at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (route === '/game') return <GamePage />;

  const lessonMatch = route.match(/^\/learn\/([\w-]+)$/);
  if (lessonMatch) return <LessonPage lessonId={lessonMatch[1]} />;

  return <HomePage />;
}
