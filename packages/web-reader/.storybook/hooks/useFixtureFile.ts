import { useState, useEffect } from 'react'

export function useFixtureFile(path: string) {
  const [fixture, setFixture] = useState(null as File | null)

  useEffect(() => {
    const parts = path.split('/')
    const fname = parts[parts.length - 1]

    fetch(`http://localhost:9001/fixtures/${path}`)
      .then(res => res.blob())
      .then(blob => {
        ;(blob as any).lastModified = 1618455939000
        ;(blob as any).name = fname

        setFixture(blob as File)
      })
  }, [path])

  return fixture
}
