import { gql, useQuery } from '@apollo/client'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { Directory, LibraryEntry } from '@comix/ui'
import { byKey } from 'src/helpers/util'
import { useMemo } from 'react'

export interface DirectoryPageViewProps {
  collectionPath: string
  directoryPath: string
  onSelectFile?: (file: File) => void
}

export const DirectoryPageView = ({
  collectionPath,
  directoryPath,
  onSelectFile = () => {},
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
          onClickComic={async comic => {
            const selectedFile = comic.reference as LibraryEntry
            const res = await fetch(`${FILES_HOST}?filePath=${selectedFile?.filePath}`)
            const blob = await res.blob()
            ;(blob as any).name = comic.title
            ;(blob as any).lastModified = 0

            onSelectFile(blob as File)
          }}
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images/small'
const FILES_HOST = 'http://localhost:4000/collection-files'

export const ENTRIES_QUERY = gql`
  query run($entriesInput: EntriesQuery!, $directoryInput: DirectoryQuery!) {
    entries(input: $entriesInput) {
      fileName
      filePath
      coverFileName
    }

    directory(input: $directoryInput) {
      name
    }
  }
`

const toComicEntry = (entry: LibraryEntry) => ({
  imageUrl: `${IMAGE_HOST}/${entry.coverFileName}`,
  title: entry.fileName,
  id: entry.filePath,
  reference: entry,
})
