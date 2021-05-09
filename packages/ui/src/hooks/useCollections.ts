import { useQuery, gql, ApolloError } from '@apollo/client'
import { LibraryCollection } from '../types/apiSchema'

export type UseCollectionsHook = () => {
  collections: LibraryCollection[]
  loading: boolean
  error?: ApolloError
}

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
