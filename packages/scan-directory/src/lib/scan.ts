import fs from 'fs/promises'
import globby from 'globby'

export const scan = async (dir: string, extensions: string[]) => {
  const results = await globby(dir, {
    expandDirectories: {
      extensions
    }
  })

  return Promise.all(results.map(async fpath => {
    const stats = await fs.stat(fpath)
    return { path: fpath, lastModified: stats.mtimeMs }
  }))
}
