import { gql, useQuery } from '@apollo/client'
import { UseVolumesHook } from '../types'
import { LibraryVolume } from '../types/apiSchema'

export const QUERY = gql`
  query run($input: VolumesQuery!) {
    volumes(input: $input) {
      source
      sourceId
      name
    }
  }
`

export const useVolumes: UseVolumesHook = (collectionPath: string) => {
  const { data, loading, error } = useQuery<{ volumes: LibraryVolume[] }>(QUERY, {
    variables: { input: { collection: collectionPath } }
  })

  return { loading, error, volumes: data?.volumes || [] }
}
