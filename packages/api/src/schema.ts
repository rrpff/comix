import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'
import CollectionsSchema from './schemas/Collections'
import DirectoriesSchema from './schemas/Directories'
import EntriesSchema from './schemas/Entries'
import { GraphqlContext } from './types'
import { Resolvers } from './types/schema'
import { collections } from './queries/collections'
import { collection } from './queries/collection'
import { directory } from './queries/directory'
import { entries } from './queries/entries'
import { createCollection } from './mutations/createCollection'
import { updateCollection } from './mutations/updateCollection'
import { deleteCollection } from './mutations/deleteCollection'

const BaseSchema = gql`
  type MutationResult {
    success: Boolean!
  }

  type Query {
    dummy: String
  }

  type Mutation {
    dummy: String
  }

  type Subscription {
    dummy: String
  }
`

const typeDefs = [
  BaseSchema,
  CollectionsSchema,
  DirectoriesSchema,
  EntriesSchema,
]

const resolvers: Resolvers = {
  Query: {
    collections,
    collection,
    directory,
    entries,
  },
  Mutation: {
    createCollection,
    updateCollection,
    deleteCollection,
  },
  Subscription: {
    collectionCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_CREATED'])
    },
    collectionUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_UPDATED'])
    },
    collectionDeleted: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_DELETED'])
    },
    entryCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_CREATED'])
    },
    entryUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_UPDATED'])
    },
    entryDeleted: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_DELETED'])
    },
  }
}

export default makeExecutableSchema<GraphqlContext>({
  typeDefs,
  resolvers,
})
