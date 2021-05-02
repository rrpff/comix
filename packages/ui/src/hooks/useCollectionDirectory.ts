import { useQuery, gql } from '@apollo/client'
import { LibraryEntry } from '../types/apiSchema'

export const QUERY = gql`
  query run($input: EntriesQuery!) {
    entries(input: $input) {
      fileName
      filePath
      fileLastModified
      fileLastProcessed
      corrupt
      coverFileName
      volumeName
      volumeYear
    }
  }
`

export const useCollectionDirectory = (collection?: string | null, directoryPath?: string | null) => {
  const { data, loading, error } = useQuery<{ entries: LibraryEntry[] }>(QUERY, {
    variables: { input: { collection, directoryPath } }
  })

  if (!collection || !directoryPath)
    return { entries: [], loading: false, error: undefined }

  return { entries: data?.entries as LibraryEntry[] || [], loading, error }
}