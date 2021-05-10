import { gql, useQuery } from '@apollo/client'
import { CreditType, UseCreditHook } from '../types'

export const useCredit: UseCreditHook = (identifier, type) => {
  const { data, loading, error } = useQuery(queryFor(type), {
    variables: { input: identifier }
  })

  const credit = data ? data[`${type}Credit`] : undefined

  return { credit, loading, error }
}

export const queryFor = (type: CreditType) => gql`
  query run($input: CreditInput!) {
    ${type}Credit(input: $input) {
      source
      sourceId
      type
      name

      issues {
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

            progress {
              currentPage
              pageCount
              finished
            }
          }
        }
      }
    }
  }
`
