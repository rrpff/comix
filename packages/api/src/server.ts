import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import schema from './schema'
import { GraphqlContext } from './types'

const app = express()

const context = (): GraphqlContext => {
  return {
    loaders: {}
  }
}

const apollo = new ApolloServer({
  schema,
  context
})

apollo.applyMiddleware({ app, path: '/graphql' })

export default app
