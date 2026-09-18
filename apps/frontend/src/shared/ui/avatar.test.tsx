import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it.each([
    ['  Анна  Мария\tКотова ', 'АК'],
    ['Анна', 'А'],
    ['éva 李', 'É李'],
    ['👩‍💻 Тест', '👩‍💻Т'],
  ])('derives initials for %s', (name, letters) => {
    render(<Avatar name={name} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(
      name.trim().replace(/\s+/gu, ' '),
    );
    expect(screen.getByRole('img')).toHaveTextContent(letters);
    expect(screen.getByRole('img')).toHaveAttribute('data-size', '48');
  });
  it('uses a labelled user icon for an empty name', () => {
    const { container } = render(
      <Avatar name="   " size={32} className="custom" src=" " />,
    );
    expect(screen.getByRole('img', { name: 'Пользователь' })).toHaveClass(
      'custom',
    );
    expect(container.querySelector('.mm-icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container.querySelector('img')).toBeNull();
  });
  it('hides decorative avatars from the accessibility tree', () => {
    const { container } = render(<Avatar name="Анна" decorative size={64} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstChild).not.toHaveAttribute('aria-label');
  });
  it('keeps initials while loading, reveals image on load and falls back on error without retry', () => {
    const { container, rerender } = render(
      <Avatar name="Анна Котова" src=" /one.png " />,
    );
    const avatar = screen.getByRole('img');
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('src', '/one.png');
    expect(img).toHaveAttribute('data-loaded', 'false');
    expect(avatar).toHaveTextContent('АК');
    fireEvent.load(img);
    expect(img).toHaveAttribute('data-loaded', 'true');
    expect(avatar).toHaveTextContent('');
    fireEvent.error(img);
    expect(avatar).toHaveTextContent('АК');
    expect(container.querySelector('img')).toBeNull();
    rerender(<Avatar name="Мария Котова" src="/one.png" />);
    expect(avatar).toHaveTextContent('МК');
    expect(container.querySelector('img')).toBeNull();
  });
  it('resets failed and loaded states on URL changes and ignores stale image events', () => {
    const { container, rerender } = render(<Avatar name="Анна" src="/a.png" />);
    const old = container.querySelector('img')!;
    fireEvent.error(old);
    rerender(<Avatar name="Борис" src="/b.png" />);
    const current = container.querySelector('img')!;
    fireEvent.load(old);
    expect(current).toHaveAttribute('data-loaded', 'false');
    expect(screen.getByRole('img')).toHaveTextContent('Б');
    fireEvent.load(current);
    rerender(<Avatar name="Саша" src="/c.png" />);
    expect(container.querySelector('img')).toHaveAttribute(
      'data-loaded',
      'false',
    );
    fireEvent.error(current);
    expect(container.querySelector('img')).toHaveAttribute('src', '/c.png');
    rerender(<Avatar name="Саша" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img')).toHaveTextContent('С');
  });
  it('uses anonymous fallback after an image fails and safely unmounts', () => {
    const { container, unmount } = render(<Avatar name="" src="/bad.png" />);
    const img = container.querySelector('img')!;
    fireEvent.error(img);
    expect(container.querySelector('.mm-icon')).toBeInTheDocument();
    unmount();
    fireEvent.load(img);
    expect(container).toBeEmptyDOMElement();
  });
});
