import { act, screen } from '@testing-library/react';
import * as ReactDOM from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

let mountedRoot: ReturnType<typeof ReactDOM.createRoot> | undefined;

// Keep the real renderer; retain its root only for deterministic teardown.
vi.mock('react-dom/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactDOM>();
  return {
    ...actual,
    createRoot: (...args: Parameters<typeof actual.createRoot>) => {
      mountedRoot = actual.createRoot(...args);
      return mountedRoot;
    },
  };
});

afterEach(async () => {
  await act(async () => mountedRoot?.unmount());
  mountedRoot = undefined;
  document.body.replaceChildren();
  vi.resetModules();
});

describe('browser entrypoint', () => {
  it('mounts the application into the HTML root', async () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.append(host);
    await act(async () => {
      await import('./main');
    });

    expect(host).toContainElement(
      screen.getByRole('heading', { name: 'Мой МИР', level: 1 }),
    );
  });

  it('fails explicitly when the HTML mount point is missing', async () => {
    await expect(import('./main')).rejects.toThrow(
      'Application root element is missing',
    );
    expect(document.body).toBeEmptyDOMElement();
  });
});
