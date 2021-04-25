import globby from 'globby'

export const scan = (dir: string) => {
  return globby(dir, {
    expandDirectories: {
      extensions: ['cbr', 'cbz']
    }
  })
}
