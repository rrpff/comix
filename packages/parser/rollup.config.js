import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/index.ts',
  output: [
    {
      dir: './dist/esm',
      format: 'esm',
      sourcemap: true,
    },
    {
      dir: './dist/commonjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      dir: './dist/umd',
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
