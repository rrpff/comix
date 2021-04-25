import { ComicFileStat, diff } from './lib/diff'
import { scan } from './lib/scan'

export { metadata } from './lib/metadata'

export const scanDirectory = async (dirname: string, comparison: ComicFileStat[]) => {
  const state = await scan(dirname)

  return diff(state, comparison)
}
