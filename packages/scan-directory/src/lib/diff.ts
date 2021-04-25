export interface ComicFileStat {
  path: string
  lastModified: number
}

export const diff = (now: ComicFileStat[], then: ComicFileStat[]) => {
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
