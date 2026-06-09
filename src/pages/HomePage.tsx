import { useMemo } from 'react';
import { LESSONS, LessonLevel, loadCompletedLessons } from '../lib/lessons';

const LEVEL_CLASS: Record<LessonLevel, string> = {
  Beginner: 'level--beginner',
  Easy: 'level--easy',
  Intermediate: 'level--intermediate',
  Advanced: 'level--advanced',
};

export function HomePage() {
  const completed = useMemo(() => loadCompletedLessons(), []);
  const firstUnfinished = LESSONS.find(l => !completed.has(l.id)) ?? LESSONS[0];

  return (
    <div className="tutorial">
      <header className="home__hero">
        <h1 className="home__title">SUDOKU</h1>
        <p className="home__subtitle">Learn every technique. Then beat the grid.</p>
        <p className="home__intro">
          Nine interactive lessons take you from your very first move to expert-level
          eliminations — each one played out on a real board, with your fingers on the cells.
        </p>
        <div className="home__cta">
          <a className="btn btn--primary btn--big" href={`#/learn/${firstUnfinished.id}`}>
            {completed.size > 0 ? 'Continue learning' : 'Start learning'}
          </a>
          <a className="btn btn--ghost btn--big" href="#/game">
            Play Sudoku ▶
          </a>
        </div>
        {completed.size > 0 && (
          <p className="home__progress">
            {completed.size} of {LESSONS.length} techniques mastered
          </p>
        )}
      </header>

      <section className="home__section">
        <h2 className="home__section-title">Solving techniques</h2>
        <div className="home__cards">
          {LESSONS.map((lesson, i) => (
            <a key={lesson.id} className="card" href={`#/learn/${lesson.id}`}>
              <div className="card__top">
                <span className="card__num">{i + 1}</span>
                <span className={`card__level ${LEVEL_CLASS[lesson.level]}`}>{lesson.level}</span>
                {completed.has(lesson.id) && (
                  <span className="card__done" title="Completed">
                    ✓
                  </span>
                )}
              </div>
              <h3 className="card__title">{lesson.title}</h3>
              <p className="card__tagline">{lesson.tagline}</p>
              <p className="card__summary">{lesson.summary}</p>
              <span className="card__go">Learn it →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="home__section home__beyond">
        <h2 className="home__section-title">Beyond the course</h2>
        <p className="home__beyond-text">
          Hungry for more after the X-Wing? The same elimination mindset scales up:
          <strong> Swordfish</strong> and <strong>Jellyfish</strong> extend the X-Wing to three
          and four rows; <strong>XY-Wing</strong> chains three two-candidate cells together;
          <strong> Hidden Pairs and Triples</strong> mirror their naked cousins; and
          <strong> coloring</strong> tracks chains of a single digit across the grid. Every one
          of them boils down to what you’ve practised here: find a constraint, eliminate
          candidates, and let the singles fall out.
        </p>
        <a className="btn btn--primary" href="#/game">
          Put it into practice — play now ▶
        </a>
      </section>
    </div>
  );
}
