import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: path.join('src', 'index.ts'),
    output: [
      {
        dir: path.join('dist', 'esm'),
        format: 'esm',
        sourcemap: true,
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        module: 'esnext',
        declaration: true,
        declarationDir: path.join('dist', 'esm', 'types')
      }),
    ],
  },
  {
    input: path.join('src', 'index.ts'),
    output: [
      {
        dir: path.join('dist', 'commonjs'),
        format: 'cjs',
        sourcemap: true,
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        module: 'esnext',
        declaration: true,
        declarationDir: path.join('dist', 'commonjs', 'types')
      }),
    ],
  },
  {
    input: path.join('src', 'index.ts'),
    output: [
      {
        dir: path.join('dist', 'umd'),
        format: 'umd',
        name: 'ComixParser',
        sourcemap: true,
      }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ module: 'esnext' }),
    ],
  }
]
