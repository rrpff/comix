import { gql } from 'graphql-tag'

export default gql`
  type LibraryCollection {
    name: String!
    path: String!
  }

  input CollectionInput {
    path: String!
  }

  extend type Query {
    collections: [LibraryCollection!]!
    collection(input: CollectionInput!): LibraryCollection!
  }
`
