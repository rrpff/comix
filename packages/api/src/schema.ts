import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'
import CollectionsSchema from './schemas/Collections'
import EntriesSchema from './schemas/Entries'
import { GraphqlContext } from './types'
import { Resolvers } from './types/schema'
import { collections } from './queries/collections'
import { collection } from './queries/collection'
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
  EntriesSchema,
]

const resolvers: Resolvers = {
  Query: {
    collections,
    collection,
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
  }
}

export default makeExecutableSchema<GraphqlContext>({
  typeDefs,
  resolvers,
})
