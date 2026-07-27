const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^server-only$': '<rootDir>/__mocks__/empty.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(config)
