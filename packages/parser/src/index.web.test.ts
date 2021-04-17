/**
 * @jest-environment jsdom
 */

import path from 'path'
import fs from 'fs'
import { ComicPage, Parser } from '.'

const ZIP_EXAMPLES = [
  {
    comicFileName: 'wytches-sample.cbz',
    pageFilePaths: [
      'wytches-sample/0001.jpeg',
      'wytches-sample/0002.jpeg',
      'wytches-sample/0003.jpeg',
      'wytches-sample/0004.jpeg',
    ]
  },
  {
    comicFileName: 'phonogram-sample.cbz',
    pageFilePaths: [
      'phonogram-sample/0001.jpeg',
      'phonogram-sample/0002.jpeg',
      'phonogram-sample/0003.jpeg',
      'phonogram-sample/0004.jpeg',
      'phonogram-sample/0005.jpeg',
    ]
  },
]

describe.each(ZIP_EXAMPLES)('cbz files', ({ comicFileName, pageFilePaths }) => {
  const subject = async () => {
    const subject = new Parser()
    const file = await openW3cFile(fixturePath(comicFileName))
    return await subject.parse(file)
  }

  it('includes the name', async () => {
    const comic = await subject()
    expect(comic.name).toEqual(comicFileName)
  })

  it('includes the correct number of pages', async () => {
    const comic = await subject()
    expect(comic.pages.length).toEqual(pageFilePaths.length)
  })

  it('includes pages sorted by index', async () => {
    const comic = await subject()
    expect(comic.pages.map(p => [p.index, p.name])).toEqual(
      pageFilePaths.map((path, index) => [index, path])
    )
  })

  it.each(
    pageFilePaths.map((path, index): [number, string] => [index, path])
  )('can read page contents correctly', async (index, pageImage) => {
    const comic = await subject()
    const page = comic.pages[index]

    expectPageToMatchFile(page, fixturePath(pageImage))
  })
})

async function expectPageToMatchFile(page: ComicPage, fpath: string) {
  const fileBuf = await fs.promises.readFile(fpath)
  const pageBuf = Buffer.from(await page.read())
  const isMatch = 0 === Buffer.compare(fileBuf, pageBuf)

  expect(isMatch).toEqual(true)
}

async function openW3cFile(fpath: string): Promise<File> {
  const buf = await fs.promises.readFile(fpath)
  const blob = new Blob([buf], { type: '' })
  ;(blob as any).lastModified = 1618455939000
  ;(blob as any).name = path.basename(fpath)

  return <File>blob
}

function fixturePath(...sections: string[]) {
  return path.join(__dirname, '..', 'test', 'fixtures', ...sections)
}
