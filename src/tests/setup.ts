// src/tests/setup.ts
import { jest } from '@jest/globals';

// 模擬 localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        key: (index: number) => Object.keys(store)[index] || null,
        get length() {
            return Object.keys(store).length;
        }
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

// 模擬 window
if (typeof window === 'undefined') {
    (global as any).window = global;
    (global as any).window.addEventListener = () => { };
    (global as any).window.removeEventListener = () => { };
}

// 模擬 console.time / console.timeEnd
if (typeof console.time !== 'function') {
    console.time = () => { };
}
if (typeof console.timeEnd !== 'function') {
    console.timeEnd = () => { };
}
