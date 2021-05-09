import { ApolloError, gql, useQuery } from '@apollo/client'
import { LibraryIdentifier } from '../types'
import { LibraryIssue } from '../types/apiSchema'

export type UseIssueHook = (identifier: LibraryIdentifier) => {
  issue?: LibraryIssue
  loading: boolean
  error?: ApolloError
}

export const QUERY = gql`
  query run($input: IssueInput!) {
    issue(input: $input) {
      source
      sourceId
      issueNumber
      coverDate
      name

      volume {
        source
        sourceId
        name
      }

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
`

export const useIssue: UseIssueHook = (identifier: LibraryIdentifier) => {
  const { data, loading, error } = useQuery<{ issue: LibraryIssue }>(QUERY, {
    variables: { input: identifier }
  })

  return { loading, error, issue: data?.issue }
}
