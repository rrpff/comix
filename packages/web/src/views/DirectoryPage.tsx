import { gql, useQuery } from '@apollo/client'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { Directory, LibraryEntry } from '@comix/ui'
import { byKey } from '../helpers/util'
import { useMemo } from 'react'
import { ComicEntryProps } from '@comix/ui/components/ComicEntry'

export interface DirectoryPageViewProps {
  collectionPath: string
  directoryPath: string
  onSelectEntry?: (entry: LibraryEntry) => void
}

export const DirectoryPageView = ({
  collectionPath,
  directoryPath,
  onSelectEntry = () => {},
}: DirectoryPageViewProps) => {
  const { data, loading } = useQuery<{ directory: Directory, entries: LibraryEntry[] }>(ENTRIES_QUERY, { variables: {
    entriesInput: { collection: collectionPath, directoryPath: directoryPath },
    directoryInput: { path: directoryPath },
  } })

  const comics = useMemo(() => {
    return data?.entries !== undefined
      ? data.entries.map(toComicEntry).sort(byKey('title'))
      : []
  }, [data?.entries])

  return (
    <PageContent loading={loading} title={data?.directory.name} category="Directory" data-testid="container">
      <section data-testid="contents">
        <ComicEntryList
          comics={comics}
          loading={loading}
          onClickComic={comic => onSelectEntry(comic.reference)}
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images/small'

export const ENTRIES_QUERY = gql`
  query run($entriesInput: EntriesQuery!, $directoryInput: DirectoryQuery!) {
    entries(input: $entriesInput) {
      fileName
      filePath
      coverFileName

      progress {
        currentPage
        pageCount
        finished
      }
    }

    directory(input: $directoryInput) {
      name
    }
  }
`

const toComicEntry = (entry: LibraryEntry): ComicEntryProps => ({
  imageUrl: `${IMAGE_HOST}/${entry.coverFileName}`,
  title: entry.fileName,
  id: entry.filePath,
  reference: entry,
  readingProgress: progressFor(entry),
})

const progressFor = (entry: LibraryEntry) => {
  if (!entry.progress) return 0.0
  if (entry.progress.finished) return 1.0

  return entry.progress.currentPage / entry.progress.pageCount
}
