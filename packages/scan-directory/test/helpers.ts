import path from 'path'

export const fixturePath = (...parts: string[]) => {
  return path.join(__dirname, 'fixtures', ...parts)
}
