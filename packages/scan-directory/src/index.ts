import { FileStat, diff } from './lib/diff'
import { scan } from './lib/scan'

export type { FileStat, FileDiff } from './lib/diff'
export { scan } from './lib/scan'
export { diff } from './lib/diff'

export const scanDirectory = async (dirname: string, extensions: string[], comparison: FileStat[]) => {
  const state = await scan(dirname, extensions)

  return diff(state, comparison)
}
