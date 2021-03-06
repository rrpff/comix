import { Reader } from '@comix/parser'
import { useEffect, useState } from 'react'
import { UseComicReaderHook } from '../types'

export const useComicReader: UseComicReaderHook = (file?: File, startingPage?: number) => {
  const [reader, setReader] = useState(null as Reader | null)

  useEffect(() => {
    if (file === undefined) return setReader(null);

    Reader.read(file, startingPage).then(reader => {
      setReader(reader)
    })

    return () => {}
  }, [file])

  return reader
}
