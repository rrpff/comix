import { Reader } from '@comix/parser'
import { useState, useEffect } from 'react'

interface ComicPageWithUrl {
  index: number
  name: string
  type: string
  url: string
}

export const useComic = (reader: Reader | null) => {
  const [loading, setLoading] = useState(true)
  const [cachedPages, setCachedPages] = useState([] as ComicPageWithUrl[])
  const [visibleIndices, setVisibleIndices] = useState([] as number[])
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (reader === null) return;

    if (isFirstLoad) {
      setLoading(false)
      setIsFirstLoad(false)
      setVisibleIndices((reader.current || []).map(page => page.imageIndex))
      setCachedPages(reader.cache.map(page => ({
        index: page.imageIndex,
        name: page.imageName,
        type: page.type,
        url: window.URL.createObjectURL(new Blob([page.image], { type: 'image/jpeg' }))
      })))
    }

    reader.on('change', async pages => {
      const newPages = pages.map(page => {
        const cached = cachedPages.find(p => p.index === page.imageIndex)
        return cached || {
          index: page.imageIndex,
          name: page.imageName,
          type: page.type,
          url: window.URL.createObjectURL(new Blob([page.image], { type: 'image/jpeg' }))
        }
      })

      setVisibleIndices(newPages.map(p => p.index))
      setCachedPages(cachedPages => [
        ...cachedPages.filter(p => !newPages.some(np => np.index === p.index)),
        ...newPages
      ])
    })

    reader.on('cache:add', page => {
      const cached = cachedPages.find(p => p.index === page.imageIndex)
      const newPages = [cached || {
        index: page.imageIndex,
        name: page.imageName,
        type: page.type,
        url: window.URL.createObjectURL(new Blob([page.image], { type: 'image/jpeg' }))
      }]

      setCachedPages(cachedPages => [
        ...cachedPages.filter(p => !newPages.some(np => np.index === p.index)),
        ...newPages
      ])
    })

    reader.on('cache:remove', page => {
      setCachedPages(cachedPages =>
        cachedPages.filter(p => p.index !== page.imageIndex)
      )
    })

    return () => { reader.removeAllListeners() }
  }, [reader, isFirstLoad, cachedPages])

  const next = () => reader?.next()
  const previous = () => reader?.previous()
  const goto = (page: number) => reader?.goto(page)

  const currentPages = visibleIndices
    .map(index => cachedPages.find(p => p.index === index))
    .filter(page => page !== undefined) as ComicPageWithUrl[]

  const preloadedPages = cachedPages
    .filter(p => !visibleIndices.includes(p.index)) as ComicPageWithUrl[]

  return { loading, currentPages, preloadedPages, next, previous, goto }
}
