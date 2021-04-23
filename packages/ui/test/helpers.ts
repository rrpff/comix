import fs from 'fs'
import path from 'path'

export async function expectBlobToMatchFile(blob: Blob, fpath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = (e) => reject(e.target?.error)
    reader.onload = async (e) => {
      const expectedBuf = await fs.promises.readFile(fpath)
      const actualBuf = Buffer.from(e.target?.result || '' as any)
      const isMatch = 0 === Buffer.compare(expectedBuf, actualBuf)

      expect(isMatch).toEqual(true)
      resolve()
    }

    reader.readAsArrayBuffer(blob)
  })
}

export async function openW3cFile(fpath: string): Promise<File> {
  const buf = await fs.promises.readFile(fpath)
  const blob = new Blob([buf], { type: '' })
  ;(blob as any).arrayBuffer = async () => buf.buffer
  ;(blob as any).lastModified = 1618455939000
  ;(blob as any).name = path.basename(fpath)

  return blob as File
}

export function fixturePath(...sections: string[]) {
  return path.join(__dirname, 'fixtures', ...sections)
}
