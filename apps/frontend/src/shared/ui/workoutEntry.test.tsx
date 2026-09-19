import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkoutEntryConfiguration } from './generated/workoutEntry';
import { WorkoutEntry } from './workoutEntry';

describe('WorkoutEntry', () => {
  it('renders strength data and emits edit without mutating values', () => {
    const onAction = vi.fn();
    render(
      <WorkoutEntry
        metric="strength"
        dateLabel="18.09.2026"
        exercise="Приседания"
        sets={3}
        repetitions={12}
        weightLabel="40 кг"
        statusMessage="Результат сохранён"
        onAction={onAction}
        className="custom"
      />,
    );
    const entry = screen.getByRole('article', { name: 'Приседания' });
    expect(entry).toHaveClass('custom');
    expect(screen.getByText('3 × 12 × 40 кг')).toBeVisible();
    expect(screen.getByText('Выполнено')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Изменить результат' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Результат сохранён');
  });

  it('renders distance values and disables edit without an owner', () => {
    render(
      <WorkoutEntry
        metric="distance"
        dateLabel="18.09.2026"
        activity="Бег"
        distanceLabel="12 км"
        durationLabel="1:08:00"
      />,
    );
    expect(screen.getByText('12 км · 1:08:00')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Изменить результат' }),
    ).toBeDisabled();
  });

  it('opens a summary through a native link with caller bindings', () => {
    const onClick = vi.fn((event) => event.preventDefault());
    render(
      <WorkoutEntry
        metric="summary"
        dateLabel="01–18 сентября 2026"
        periodLabel="Сводка периода"
        lastResult="3 × 12 × 40 кг"
        compressedAtLabel="18.09"
        lastResultAtLabel="18.09"
        href="/workouts/summary"
        linkProps={{ className: 'custom-link', target: '_blank', onClick }}
      />,
    );
    const link = screen.getByRole('link', { name: 'Открыть сводку' });
    expect(link).toHaveAttribute('href', '/workouts/summary');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('custom-link');
    expect(screen.getByText('Сжато 18.09 · Последний: 18.09')).toBeVisible();
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('supports an owner callback for a summary without a link', () => {
    const onAction = vi.fn();
    render(
      <WorkoutEntry
        metric="summary"
        dateLabel="01–18 сентября 2026"
        periodLabel="Сводка периода"
        lastResult="3 × 12 × 40 кг"
        compressedAtLabel="18.09"
        lastResultAtLabel="18.09"
        onAction={onAction}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Открыть сводку' }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

// Generated discriminants prevent incomplete metric data.
// @ts-expect-error Strength requires repetitions and weight.
const incompleteStrength: WorkoutEntryConfiguration = {
  metric: 'strength',
  dateLabel: '18.09',
  exercise: 'Приседания',
  sets: 3,
};
void incompleteStrength;
