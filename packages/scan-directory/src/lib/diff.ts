export interface FileStat {
  path: string
  lastModified: number
}

export interface FileDiff {
  created: FileStat[]
  changed: FileStat[]
  deleted: FileStat[]
}

export const diff = (now: FileStat[], then: FileStat[]): FileDiff => {
  const created = now.filter(stat => {
    return !then.some(f => f.path === stat.path)
  })

  const changed = now.filter(stat => {
    return then.some(f => f.path === stat.path && f.lastModified !== stat.lastModified)
  })

  const deleted = then.filter(stat => {
    return !now.some(f => f.path === stat.path)
  })

  return {
    created,
    changed,
    deleted,
  }
}
