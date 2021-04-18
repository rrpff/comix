import fs from 'fs'
import path from 'path'
import { ComicImage } from '../src/protocols'

export async function expectImageToMatchFile(image: ComicImage, fpath: string) {
  const expectedBuf = await fs.promises.readFile(fpath)
  const actualBuf = Buffer.from(await image.read())
  const isMatch = 0 === Buffer.compare(expectedBuf, actualBuf)

  expect(isMatch).toEqual(true)
}

export async function openW3cFile(fpath: string): Promise<File> {
  const buf = await fs.promises.readFile(fpath)
  const blob = new Blob([buf], { type: '' })
  ;(blob as any).arrayBuffer = async () => buf.buffer
  ;(blob as any).lastModified = 1618455939000
  ;(blob as any).name = path.basename(fpath)

  return <File>blob
}

export function fixturePath(...sections: string[]) {
  return path.join(__dirname, 'fixtures', ...sections)
}
