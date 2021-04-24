import path from 'path'
import fs from 'fs'
import isSubdir from 'is-subdir'
import { GetFileService } from '../../src/protocols/services'

// lets just hardcode this for now eh
const PERMITTED_DIRECTORY_ROOTS = [
  '/Volumes/Richard/comics',
  path.join(__dirname, '..', '..'),
]

const directoryIsPermitted = async (dirpath: string) => {
  return PERMITTED_DIRECTORY_ROOTS.some(parent => isSubdir(parent, dirpath))
}

export const GetFile: GetFileService = async (fpath: string) => {
  const dirpath = path.dirname(fpath)
  const authorised = await directoryIsPermitted(dirpath)

  if (!authorised) return { error: `Not authorised to read from "${dirpath}"` }

  const fname = path.basename(fpath)

  try {
    const content = await fs.promises.readFile(fpath)

    return {
      success: {
        path: fpath,
        name: fname,
        type: '',
        content: content.slice()
      },
      error: `File "${fname}" does not exist`
    }
  } catch (e) {
    if (e.code === 'ENOENT') return { error: `File "${fname}" does not exist` }
    return { error: 'Unknown error' }
  }
}
