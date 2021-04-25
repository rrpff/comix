import path from 'path'
import fs from 'fs/promises'

export const fixturePath = (...parts: string[]) => {
  return path.join(__dirname, 'fixtures', ...parts)
}

export const fixtureLastModified = async (...parts: string[]) => {
  const stats = await fs.stat(fixturePath(...parts))
  return stats.mtimeMs
}
