import { useQuery, gql } from '@apollo/client'
import { UseCreditsHook, CreditType } from '../types'

export const useCredits: UseCreditsHook = (collection, type) => {
  const { data, error, loading } = useQuery(queryFor(type), {
    variables: { input: { collection } }
  })

  const credits = data ? data[`${type}Credits`] : []

  return { credits, loading, error }
}

export const queryFor = (type: CreditType) => {
  const additionalFields = type === 'person'
    ? 'roles\n'
    : ''

  return gql`
    query run($input: CreditQuery!) {
      ${type}Credits(input: $input) {
        source
        sourceId
        type
        name
        ${additionalFields}
      }
    }
  `
}
