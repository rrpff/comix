import { Reader } from '@comix/parser'
import { renderHook } from '@testing-library/react-hooks'
import { fixturePath, openW3cFile } from '../../test/helpers'
import { useComicReader } from './useComicReader'

it('returns null when given file is undefined', () => {
  const { result } = renderHook(() => useComicReader(undefined))

  expect(result.current).toEqual(null)
})

it.each([
  { fpath: fixturePath('wytches-sample.cbr'), numImages: 4 },
  { fpath: fixturePath('phonogram-sample.cbz'), numImages: 5 },
])('returns a ComicReader when given file is a comic', async ({ fpath, numImages }) => {
  const file = await openW3cFile(fpath)
  const { result, waitForNextUpdate } = renderHook(() => useComicReader(file))

  await waitForNextUpdate()

  expect(result.current).toBeInstanceOf(Reader)
  expect(result.current?.comic.images.length).toEqual(numImages)
})
