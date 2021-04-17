import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/umd/index.js',
      format: 'umd',
      name: 'ComixParser',
      sourcemap: true,
    }
  ],
  plugins: [
    nodeResolve(),
    typescript({ module: 'esnext' })
  ]
}
