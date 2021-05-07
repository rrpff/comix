import path from 'path'
import fs from 'fs/promises'
import { LibraryEntry } from '@comix/library'
import { parseComicTitles } from './parseComicTitles'

export const parseComicTitleForEntry = async (entry: LibraryEntry) => {
  const dirname = path.dirname(entry.filePath)
  const directoryFpaths = (await fs.readdir(dirname, { withFileTypes: true }))
    .filter(entry => entry.isFile())
    .map(entry => path.join(dirname, entry.name))

  const entriesDetails = parseComicTitles(directoryFpaths)
  return entriesDetails.find(details => details.path === entry.filePath)
}
