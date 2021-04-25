import { diff } from './diff'

it('returns no changes when no inputs are given', () => {
  const changes = diff([], [])
  expect(changes).toEqual({
    created: [],
    changed: [],
    deleted: []
  })
})

it('returns created files when they are only present now', () => {
  const file = { path: '/twin-peaks', lastModified: 0 }
  const changes = diff([file], [])

  expect(changes).toEqual({
    created: [file],
    changed: [],
    deleted: []
  })
})

it('returns deleted files when they were only present previously', () => {
  const file = { path: '/x-files', lastModified: 0 }
  const changes = diff([], [file])

  expect(changes).toEqual({
    created: [],
    changed: [],
    deleted: [file]
  })
})

it('returns changed files when they were present but their lastModified has changed', () => {
  const changes = diff(
    [{ path: '/buffy', lastModified: 30 }],
    [{ path: '/buffy', lastModified: 60 }]
  )

  expect(changes).toEqual({
    created: [],
    changed: [{ path: '/buffy', lastModified: 30 }],
    deleted: []
  })
})

it('excludes files that have not changed', () => {
  const changes = diff(
    [{ path: '/sopranos', lastModified: 75 }],
    [{ path: '/sopranos', lastModified: 75 }]
  )

  expect(changes).toEqual({
    created: [],
    changed: [],
    deleted: []
  })
})
