import { Reader } from '@comix/parser'
import { act, renderHook } from '@testing-library/react-hooks'
import { expectBlobToMatchFile, fixturePath, openW3cFile } from '../../test/helpers'
import { useComic } from './useComic'

const createReader = async () => {
  const file = await openW3cFile(fixturePath('wytches-sample.cbr'))
  return await Reader.read(file)
}

const originalCreateObjectURL = window.URL.createObjectURL
const stubObjectURL = Math.random().toString()
beforeEach(() => { window.URL.createObjectURL = () => stubObjectURL })
afterEach(() => { window.URL.createObjectURL = originalCreateObjectURL })

it('has a loading state of true while the reader is null', async () => {
  const { result } = renderHook(() => useComic(null))

  expect(result.current.loading).toEqual(true)
})

it('has a loading state of false when the reader is not null', async () => {
  const reader = await createReader()
  const { result } = renderHook(() => useComic(reader))

  expect(result.current.loading).toEqual(false)
})

it('returns currently visible pages', async () => {
  const reader = await createReader()
  const { result } = renderHook(() => useComic(reader))

  expect(result.current.currentPages).toMatchObject([{
    index: 0,
    name: 'wytches-sample/0001.jpeg',
    type: 'single',
    url: stubObjectURL
  }])
})

it('passes image data to window.URL.createObjectURL', async () => {
  const reader = await createReader()
  const spy = jest.fn<string, [Blob]>(() => stubObjectURL)
  window.URL.createObjectURL = spy

  renderHook(() => useComic(reader))

  const calls = spy.mock.calls
  await expectBlobToMatchFile(calls[0][0], fixturePath('wytches-sample', '0001.jpeg'))
  await expectBlobToMatchFile(calls[1][0], fixturePath('wytches-sample', '0002.jpeg'))
  await expectBlobToMatchFile(calls[2][0], fixturePath('wytches-sample', '0003.jpeg'))
  expect(calls.length).toEqual(3)
})

it('calls next on the reader when calling next', async () => {
  const reader = await createReader()
  reader.next = jest.fn()

  const { result } = renderHook(() => useComic(reader))

  result.current.next()
  expect(reader.next).toHaveBeenCalled()
})

it('calls previous on the reader when calling previous', async () => {
  const reader = await createReader()
  reader.previous = jest.fn()

  const { result } = renderHook(() => useComic(reader))

  result.current.previous()
  expect(reader.previous).toHaveBeenCalled()
})

it('calls goto on the reader when calling goto', async () => {
  const reader = await createReader()
  const pageNumber = Math.floor(Math.random() * 100)
  reader.goto = jest.fn()

  const { result } = renderHook(() => useComic(reader))

  result.current.goto(pageNumber)
  expect(reader.goto).toHaveBeenCalledWith(pageNumber)
})

it('changes currently visible pages when changing page', async () => {
  const reader = await createReader()
  const { result } = renderHook(() => useComic(reader))

  await act(async () => {
    await result.current.next()
  })

  expect(result.current.currentPages).toMatchObject([
    { index: 1, name: 'wytches-sample/0002.jpeg' },
    { index: 2, name: 'wytches-sample/0003.jpeg' },
  ])
})

it('returns preloaded pages', async () => {
  const reader = await createReader()
  const { result } = renderHook(() => useComic(reader))

  expect(result.current.preloadedPages).toMatchObject([
    { index: 1, name: 'wytches-sample/0002.jpeg' },
    { index: 2, name: 'wytches-sample/0003.jpeg' },
  ])
})

it('changes currently preloaded pages when changing page', async () => {
  const reader = await createReader()
  const { result } = renderHook(() => useComic(reader))

  await act(async () => {
    await result.current.next()
  })

  expect(result.current.preloadedPages).toMatchObject([
    { index: 0, name: 'wytches-sample/0001.jpeg' },
    { index: 3, name: 'wytches-sample/0004.jpeg' },
  ])
})
