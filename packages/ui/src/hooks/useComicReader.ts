import { Reader } from '@comix/parser'
import { useEffect, useState } from 'react'

export const useComicReader = (file?: File) => {
  const [reader, setReader] = useState(null as Reader | null)

  useEffect(() => {
    if (file === undefined) return setReader(null);

    Reader.read(file).then(reader => {
      setReader(reader)
    })

    return () => {}
  }, [file])

  return reader
}
