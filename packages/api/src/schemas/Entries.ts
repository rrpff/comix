import { gql } from 'graphql-tag'

export default gql`
  type LibraryEntry {
    fileName: String!
    filePath: String!
    fileLastModified: Float!
    fileLastProcessed: Float!
    corrupt: Boolean!
    coverFileName: String

    volumeName: String
    volumeYear: Int
  }

  input EntriesQuery {
    collection: String!
    directoryPath: String
  }

  extend type Query {
    entries(input: EntriesQuery!): [LibraryEntry!]!
  }
`
