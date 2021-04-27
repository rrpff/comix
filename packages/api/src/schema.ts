import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'
import CollectionsSchema from './schemas/Collections'
import { GraphqlContext } from './types'
import { Resolvers } from './types/schema'
import { collections } from './queries/collections'

const BaseSchema = gql`
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
    collections: collections
  },
  Mutation: {},
}

export default makeExecutableSchema<GraphqlContext>({
  typeDefs,
  resolvers,
})
