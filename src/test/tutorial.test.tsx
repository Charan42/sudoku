import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { HomePage } from '../pages/HomePage';
import { LessonPage } from '../pages/LessonPage';
import { LESSONS } from '../lib/lessons';

beforeAll(() => {
  // jsdom doesn't implement scrolling
  window.scrollTo = () => {};
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('HomePage', () => {
  it('renders a card for every lesson plus play links', () => {
    render(<HomePage />);
    for (const lesson of LESSONS) {
      expect(screen.getByText(lesson.title)).toBeInTheDocument();
    }
    expect(screen.getByText('Start learning')).toHaveAttribute(
      'href',
      `#/learn/${LESSONS[0].id}`
    );
    expect(screen.getByText('Play Sudoku ▶')).toHaveAttribute('href', '#/game');
  });
});

describe('LessonPage', () => {
  it('shows a friendly message for an unknown lesson', () => {
    render(<LessonPage lessonId="does-not-exist" />);
    expect(screen.getByText('Lesson not found')).toBeInTheDocument();
  });

  it('rejects wrong answers without advancing', () => {
    // Lesson 1, step 2 is find-cell with target (1,1)
    render(<LessonPage lessonId="last-cell-box" />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue →' }));
    fireEvent.click(screen.getByRole('gridcell', { name: /^Row 5, Column 5,/ }));
    expect(screen.getByText(/Not quite/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue →' })).toBeDisabled();
  });

  for (const lesson of LESSONS) {
    it(`walks through "${lesson.title}" end to end`, () => {
      render(<LessonPage lessonId={lesson.id} />);

      lesson.steps.forEach((step, i) => {
        if (step.kind === 'find-cell') {
          const [r, c] = step.target;
          fireEvent.click(
            screen.getByRole('gridcell', {
              name: new RegExp(`^Row ${r + 1}, Column ${c + 1},`),
            })
          );
          expect(screen.getByText(step.success)).toBeInTheDocument();
        } else if (step.kind === 'pick-digit') {
          fireEvent.click(screen.getByRole('button', { name: String(step.answer) }));
          expect(screen.getByText(step.success)).toBeInTheDocument();
        } else if (step.kind === 'pick-digits') {
          for (const d of step.answers) {
            fireEvent.click(screen.getByRole('button', { name: String(d) }));
          }
          fireEvent.click(screen.getByRole('button', { name: 'Check' }));
          expect(screen.getByText(step.success)).toBeInTheDocument();
        }

        const label = i === lesson.steps.length - 1 ? 'Finish ✓' : 'Continue →';
        const nextBtn = screen.getByRole('button', { name: label });
        expect(nextBtn).not.toBeDisabled();
        fireEvent.click(nextBtn);
      });

      expect(screen.getByText('Technique learned!')).toBeInTheDocument();
      // progress is persisted
      expect(window.localStorage.getItem('sudoku-tutorial-done')).toContain(lesson.id);
    });
  }
});
