import { gql } from 'graphql-tag'

export default gql`
  type LibraryCollection {
    name: String!
    path: String!
  }

  extend type Query {
    collections: [LibraryCollection!]!
  }
`
