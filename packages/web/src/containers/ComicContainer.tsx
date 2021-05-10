import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { LibraryEntry, UseComicHook, UseComicReaderHook } from '@comix/ui'
import { Spinner } from '@comix/ui/components/Spinner'
import { Comic } from '@comix/ui/components/Comic'
import { useHook } from 'react-use-dependency'

export interface ComicContainerProps {
  entry: LibraryEntry | null
}

export const ComicContainer = ({ entry }: ComicContainerProps) => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(undefined as File | undefined)
  const reader = useHook<UseComicReaderHook>('useComicReader', file)
  const comic = useHook<UseComicHook>('useComic', reader)

  useEffect(() => {
    if (entry === null) {
      setLoading(false)
      return
    }

    setLoading(true)

    fetch(`${FILES_HOST}?filePath=${entry?.filePath}`)
      .then(res => res.blob())
      .then(blob => {
        ;(blob as any).name = entry?.fileName
        ;(blob as any).lastModified = 0

        setFile(blob as File)
        setLoading(false)
      })
  }, [entry])

  const isComicLoaded = file !== undefined && !comic.loading

  if (isComicLoaded) {
    return (
      <div style={{ zIndex: 100 }}>
        <Comic
          {...comic}
          closable
          onClose={() => {
            setFile(undefined)
            setLoading(false)
          }}
        />
      </div>
    )
  }

  if (loading) return <ComicLoading />

  return null
}

const FILES_HOST = 'http://localhost:4000/collection-files'

const ComicLoading = () => {
  return (
    <Blackout>
      <Spinner size="4rem" />
    </Blackout>
  )
}

const Blackout = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 90;
  background: rgba(255, 255, 255, 0.8);
  color: #2f3542;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
`
