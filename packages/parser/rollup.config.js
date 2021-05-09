import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import copy from 'rollup-plugin-copy'

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
        dir: path.join('dist', 'commonjs-browser'),
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
        declarationDir: path.join('dist', 'commonjs-browser', 'types')
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
      alias({
        entries: [
          { find: 'node-unrar-js', replacement: 'node-unrar-js/dist' },
          { find: /CbzParser$/, replacement: './CbzNodeParser' },
          { find: /CbrParser$/, replacement: './CbrNodeParser' },
        ]
      }),
      nodeResolve(),
      commonjs(),
      typescript({
        module: 'esnext',
        declaration: true,
        declarationDir: path.join('dist', 'commonjs', 'types')
      }),
      copy({
        targets: [
          { src: 'node_modules/node-unrar-js/dist/js/unrar.wasm', dest: 'dist/commonjs' },
        ]
      }),
    ],
  }
]
