import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: path.join('src', 'index.ts'),
  output: [
    {
      dir: path.join('dist', 'esm'),
      format: 'esm',
      sourcemap: true,
    },
    {
      dir: path.join('dist', 'commonjs'),
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: path.join('dist', 'umd'),
      format: 'umd',
      name: 'ComixParser',
      sourcemap: true,
    }
  ],
  plugins: [
    nodeResolve(),
    typescript({ module: 'esnext' }),
  ]
}
