import { ApolloClient, InMemoryCache } from '@apollo/client';
import { UiProvider } from '@comix/ui'
import { ComicEntryList } from '@comix/ui/components/ComicEntryList'
import { Comic } from '@comix/ui/components/Comic'
import { useCollections } from '@comix/ui/hooks/useCollections'
import { useCollectionDirectory } from '@comix/ui/hooks/useCollectionDirectory'
import { useComicReader } from '@comix/ui/hooks/useComicReader'
import { useComic } from '@comix/ui/hooks/useComic'
import { useMemo, useState } from 'react';

const GRAPHQL_HOST = 'http://localhost:4000/graphql'
const IMAGE_HOST = 'http://localhost:4000/assets/images'
const FILE_HOST = 'http://localhost:4000/collections'

const client = new ApolloClient({
  uri: GRAPHQL_HOST,
  cache: new InMemoryCache(),
})

const Dashboard = () => {
  const { collections } = useCollections()
  const collection = useMemo(() => (collections.length > 0 && collections[0]) || null, [collections])
  const { entries, loading } = useCollectionDirectory(collection?.path, collection?.path)
  const [file, setFile] = useState(undefined as File | undefined)
  const reader = useComicReader(file)
  const comicProps = useComic(reader)

  if (comicProps.comic) {
    return (
      <Comic {...comicProps} closable onClose={() => setFile(undefined)} />
    )
  }

  return (
    <main>
      <h1>{collection?.name}</h1>

      {loading && <span>Loading...</span>}

      <ComicEntryList
        onClickComic={async comic => {
          const entry = entries.find(e => e.filePath === (comic as any).__dangerousFilePath)
          const res = await fetch(`${FILE_HOST}${collection!.path}/${entry.fileName}`)
          const file = await res.blob()
          ;(file as any).name = entry.fileName
          ;(file as any).lastModified = 0
          setFile(file as File)
        }}
        comics={entries.map(entry => ({
          title: entry.volumeName,
          subtitles: ['Issue #1', entry.volumeYear],
          imageUrl: `${IMAGE_HOST}/${entry.coverFileName}`,
          __dangerousFilePath: entry.filePath,
        }))}
      />
    </main>
  )
}

export const App = () => {
  return (
    <UiProvider client={client}>
      <Dashboard />
    </UiProvider>
  )
}
