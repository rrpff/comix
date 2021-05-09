import { useQuery, gql } from '@apollo/client'
import { UseCollectionsHook } from '../types'
import { LibraryCollection } from '../types/apiSchema'

export const QUERY = gql`
  query {
    collections {
      name
      path
    }
  }
`

export const useCollections: UseCollectionsHook = () => {
  const { data, loading, error } = useQuery<{ collections: LibraryCollection[] }>(QUERY)
  return { collections: data?.collections || [], loading, error }
}
