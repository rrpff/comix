import { gql } from 'graphql-tag'

export default gql`
  type LibraryCollectionEntry {
    collection: LibraryCollectionRef!
    entry: LibraryEntry!
  }

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

  type EntryCreatedEvent {
    path: String!
    name: String!
  }

  type EntryUpdatedEvent {
    path: String!
    name: String!
  }

  type EntryDeletedEvent {
    path: String!
  }

  type LibraryUpdateFinishedEvent {
    success: Boolean!
  }

  extend type Query {
    entries(input: EntriesQuery!): [LibraryEntry!]!
  }

  extend type Subscription {
    entryCreated: EntryCreatedEvent!
    entryUpdated: EntryUpdatedEvent!
    entryDeleted: EntryDeletedEvent!
    libraryUpdateFinished: LibraryUpdateFinishedEvent!
  }
`
