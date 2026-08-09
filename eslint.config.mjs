import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: currentDirectory })

const config = [
  {
    ignores: ['.next/**', 'next-env.d.ts', 'node_modules/**', 'public/**', 'UI/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]

export default config
