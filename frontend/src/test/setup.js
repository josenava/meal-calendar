/**
 * Test setup file for Vitest
 * Configures testing utilities and global mocks
 */
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
    cleanup()
})

// Mock window.matchMedia for components that might use it
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
})
