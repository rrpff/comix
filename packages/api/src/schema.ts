import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'
import CollectionsSchema from './schemas/Collections'
import { GraphqlContext } from './types'
import { Resolvers } from './types/schema'
import { collections } from './queries/collections'
import { collection } from './queries/collection'
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
`

const typeDefs = [
  BaseSchema,
  CollectionsSchema,
]

const resolvers: Resolvers = {
  Query: {
    collections,
    collection,
  },
  Mutation: {
    createCollection,
    updateCollection,
    deleteCollection,
  },
}

export default makeExecutableSchema<GraphqlContext>({
  typeDefs,
  resolvers,
})
