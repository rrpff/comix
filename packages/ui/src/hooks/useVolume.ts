import { gql, useQuery } from '@apollo/client'
import { LibraryIdentifier, UseVolumeHook } from '../types'
import { LibraryVolume } from '../types/apiSchema'

export const QUERY = gql`
  query run($input: VolumeInput!) {
    volume(input: $input) {
      source
      sourceId
      name
      issues {
        source
        sourceId
        issueNumber
        coverDate
        name

        entries {
          collection { path }
          entry {
            corrupt
            coverFileName
            fileLastModified
            fileLastProcessed
            fileName
            filePath
          }
        }
      }
    }
  }
`

export const useVolume: UseVolumeHook = (identifier: LibraryIdentifier) => {
  const { data, loading, error } = useQuery<{ volume: LibraryVolume }>(QUERY, {
    variables: { input: identifier }
  })

  return { loading, error, volume: data?.volume }
}
