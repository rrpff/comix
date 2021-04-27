import { gql } from 'graphql-tag'

export default gql`
  type LibraryEntry {
    fileName: String!
    filePath: String!
    fileLastModified: Float!
    fileLastProcessed: Float!
    corrupt: Boolean!
    coverFileName: String
  }

  input EntriesQuery {
    collection: String!
    directoryPath: String
  }

  extend type Query {
    entries(input: EntriesQuery!): [LibraryEntry!]!
  }
`
