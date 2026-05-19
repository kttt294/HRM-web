/**
 * Vitest Global Setup
 * Chạy trước mỗi test file
 */
import '@testing-library/jest-dom';
import { Buffer } from 'buffer';

// Mock window.atob để jsdom có thể xử lý base64 (dùng trong decodeJWT)
if (typeof window !== 'undefined' && !window.atob) {
  window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

// Mock localStorage để Zustand persist hoạt động trong môi trường test
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
