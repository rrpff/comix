import path from 'path'
import fs from 'fs/promises'
import { Comic, Parser } from '@comix/parser'
import { FileStat } from '@comix/scan-directory'
import { LibraryCollection, MetadataAdapter, MetadataAdaption, MetadataResult } from '../protocols'
import { Library } from './Library'

export const metadata = async (
  stat: FileStat,
  adapters: MetadataAdapter[],
  collection: LibraryCollection,
  library: Library,
  deferred: boolean
): Promise<MetadataResult> => {
  try {
    const fname = path.basename(stat.path)
    const parser = new Parser()
    let corrupt = false
    let comic: Comic

    try {
      comic = await parser.parse(stat.path, fname)
    } catch (e) {
      console.error(e)
      corrupt = true
    }

    const baseState = {
      repeat: false,
      entry: {
        filePath: stat.path,
        fileName: fname,
        fileLastModified: stat.lastModified,
        fileLastProcessed: Date.now(),
        corrupt,
        adaptions: [] as MetadataAdaption[]
      }
    }

    return waterfall(baseState, adapters, async (state, adapter) => {
      const { defer, changes } = await adapter.process(state.entry, comic, collection, library, deferred)
      const adaption = {
        source: adapter.constructor.name,
        changes
      }

      return {
        repeat: state.repeat || defer || false,
        entry: {
          ...state.entry,
          ...adaption.changes,
          adaptions: [
            ...state.entry.adaptions,
            adaption
          ]
        }
      }
    })
  } catch (e) {
    if (e.code === 'ENOENT')
      throw new Error(`File does not exist: ${stat.path}`)
    else throw e
  }
}

async function waterfall<T, U>(defaultState: T, items: U[], handle: (state: T, item: U) => Promise<T>) {
  let remaining = items
  let state = defaultState

  while (remaining.length > 0) {
    state = await handle(state, remaining.shift()!)
  }

  return state
}
