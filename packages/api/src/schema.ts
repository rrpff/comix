import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'

const BaseSchema = gql`
  type Query {
    dummy: String
  }

  type Mutation {
    dummy: String
  }
`

const resolvers = {
  Query: {},
  Mutation: {},
}

export default makeExecutableSchema({
  typeDefs: [BaseSchema],
  resolvers,
})
