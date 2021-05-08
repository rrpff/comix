import { Comic } from '@comix/parser'
import { Library, LibraryCollection, LibraryEntry, MetadataAdapter, MetadataAdapterResult } from '@comix/library'
import { guessComicVineIssueForEntry } from './generators/guessComicVineIssueForEntry'
import { ComicVineGateway } from './gateways/ComicVineGateway'
import { EffectCall, runEffectGenerator } from 'typed-effects'
import { getFirstIssueForEntry } from './lib/getFirstIssueForEntry'
import { compareEntryToResults } from './lib/compareEntryToResults'
import { parseComicTitleForEntry } from './lib/parseComicTitleForEntry'
import {
  COMPARE_ENTRY_TO_RESULTS,
  DEFER,
  FIRST_ISSUE_FOR_ENTRY,
  HAS_BEEN_DEFERRED,
  ISSUE,
  SEARCH,
  TRY_PARSE_ISSUE_DETAILS,
  VOLUME,
  SLEEP,
} from './effects'

export interface ComicVineMetadataAdapterConfig {
  comicVine: ComicVineGateway
}

export { ComicVineGateway } from './gateways/ComicVineGateway'

export class ComicVineMetadataAdapter implements MetadataAdapter {
  private comicVine: ComicVineGateway

  constructor(options: ComicVineMetadataAdapterConfig) {
    this.comicVine = options.comicVine
  }

  async process(
    entry: LibraryEntry,
    comic: Comic | null,
    collection: LibraryCollection,
    library: Library,
    isDeferred: boolean,
  ): Promise<MetadataAdapterResult> {
    let shouldDefer = false

    const gen = guessComicVineIssueForEntry(entry)

    const guessed = await runEffectGenerator(gen, async effect => {
      console.log(`Received effect: `, effect)

      switch (effect.type) {
        case SLEEP:
          return await new Promise(resolve => setTimeout(resolve, effect.payload as number))
        case FIRST_ISSUE_FOR_ENTRY:
          return await getFirstIssueForEntry(library, collection, effect.payload as LibraryEntry)
        case TRY_PARSE_ISSUE_DETAILS:
          return await parseComicTitleForEntry(entry)
        case COMPARE_ENTRY_TO_RESULTS:
          return await compareEntryToResults(comic!, (effect.payload as any).results)
        case SEARCH:
          return await this.comicVine.search(effect.payload as string)
        case VOLUME:
          return this.comicVine.volume(effect.payload as number)
        case ISSUE:
          return this.comicVine.issue(effect.payload as number)
        case DEFER:
          shouldDefer = true ; return
        case HAS_BEEN_DEFERRED:
          return isDeferred
      }
    })

    console.log(`GUESSED FOR ${entry.filePath}`, guessed)

    return {
      defer: shouldDefer,
      changes: {
        issue: guessed || undefined,
      }
    }
  }
}
