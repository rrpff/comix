import { gql, useQuery } from '@apollo/client'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { Directory, LibraryEntry } from '@comix/ui'

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

  return (
    <PageContent loading={loading} title={data?.directory.name} category="Directory" data-testid="container">
      <section data-testid="contents">
        <ComicEntryList
          loading={loading}
          onClickComic={async comic => {
            const selectedFile = data?.entries.find(entry => entry.fileName === comic.title)
            const res = await fetch(`${COLLECTIONS_HOST}${selectedFile?.filePath}`)
            const blob = await res.blob()
            ;(blob as any).name = comic.title
            ;(blob as any).lastModified = 0

            onSelectFile(blob as File)
          }}
          comics={data?.entries !== undefined
            ? data.entries.map(toComicEntry)
            : []
          }
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images/small'
const COLLECTIONS_HOST = 'http://localhost:4000/collections'

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
})
