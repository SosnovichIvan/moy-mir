import { describe, expect, it } from 'vitest';
import { parseApiBaseUrl } from './apiBaseUrl';

describe('public API base URL', () => {
  it.each([
    [undefined, '/api'],
    ['/api/v1', '/api/v1'],
    ['https://example.com/api/', 'https://example.com/api'],
    ['http://localhost:3000', 'http://localhost:3000'],
  ])('normalizes %s', (value, expected) => {
    expect(parseApiBaseUrl(value)).toBe(expected);
  });

  it.each([
    '',
    'api',
    '//example.com',
    '/api?token=x',
    'javascript:alert(1)',
    'https://name@example.com',
    'https://:secret@example.com',
    'https://example.com?x=1',
    'https://example.com#x',
  ])('rejects unsafe or malformed %s', (value) => {
    expect(() => parseApiBaseUrl(value)).toThrow('VITE_API_BASE_URL');
  });
});
