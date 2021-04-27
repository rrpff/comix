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

  input CollectionUpdateInput {
    path: String!
    collection: CollectionCreateInput!
  }

  input CollectionDeleteInput {
    path: String!
  }

  extend type Query {
    collections: [LibraryCollection!]!
    collection(input: CollectionInput!): LibraryCollection!
  }

  extend type Mutation {
    createCollection(input: CollectionCreateInput!): LibraryCollection!
    updateCollection(input: CollectionUpdateInput!): LibraryCollection!
    deleteCollection(input: CollectionDeleteInput!): MutationResult!
  }

  extend type Subscription {
    collectionCreated: LibraryCollection!
  }
`
