import { gql } from 'graphql-tag'

export default gql`
  type LibraryCollectionRef {
    path: String!
  }

  type LibraryCollection {
    name: String!
    path: String!
  }

  input CollectionInput {
    path: String!
  }

  input CollectionCreateInput {
    path: String!
    name: String!
  }

  type CollectionCreatedEvent {
    path: String!
    name: String!
  }

  input CollectionUpdateInput {
    path: String!
    collection: CollectionCreateInput!
  }

  type CollectionUpdatedEvent {
    path: String!
    collection: LibraryCollection!
  }

  input CollectionDeleteInput {
    path: String!
  }

  type CollectionDeletedEvent {
    path: String!
  }

  type CollectionDirectory {
    directory: [String!]!
  }

  extend type Query {
    collections: [LibraryCollection!]!
    collection(input: CollectionInput!): LibraryCollection!
    collectionDirectories(input: CollectionInput!): [CollectionDirectory!]!
  }

  extend type Mutation {
    createCollection(input: CollectionCreateInput!): LibraryCollection!
    updateCollection(input: CollectionUpdateInput!): LibraryCollection!
    deleteCollection(input: CollectionDeleteInput!): MutationResult!
  }

  extend type Subscription {
    collectionCreated: CollectionCreatedEvent!
    collectionUpdated: CollectionUpdatedEvent!
    collectionDeleted: CollectionDeletedEvent!
  }
`
