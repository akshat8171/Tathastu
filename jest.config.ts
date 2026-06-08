import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
