import { gql, useQuery } from '@apollo/client'
import { PageContent } from '@comix/ui/components/PageContent'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { Directory, LibraryEntry } from '@comix/ui'

export interface DirectoryPageViewProps {
  collectionPath: string
  directoryPath: string
}

export const DirectoryPageView = (props: DirectoryPageViewProps) => {
  const { data, loading } = useQuery<{ directory: Directory, entries: LibraryEntry[] }>(ENTRIES_QUERY, { variables: {
    entriesInput: { collection: props.collectionPath, directoryPath: props.directoryPath },
    directoryInput: { path: props.directoryPath },
  } })

  return (
    <PageContent loading={loading} title={data?.directory.name} category="Directory" data-testid="container">
      <section data-testid="contents">
        <ComicEntryList
          loading={loading}
          comics={data?.entries !== undefined
            ? data.entries.map(toComicEntry)
            : []
          }
        />
      </section>
    </PageContent>
  )
}

const IMAGE_HOST = 'http://localhost:4000/assets/images'

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
