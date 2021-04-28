import { useQuery, gql } from '@apollo/client'
import { LibraryCollection } from '../types/apiSchema'

export const QUERY = gql`
  query {
    collections {
      name
      path
    }
  }
`

export const useCollections = () => {
  const { data, loading, error } = useQuery<{ collections: LibraryCollection[] }>(QUERY)
  return { collections: data?.collections as LibraryCollection[] || [], loading, error }
}
