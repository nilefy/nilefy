import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: true,
  // clean: true,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  dts: true,
  tsconfig: './tsconfig.json',
})