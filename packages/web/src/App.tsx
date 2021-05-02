import { ApolloProvider, ApolloClient, InMemoryCache, split, HttpLink, DocumentNode } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'
import { UiProvider } from '@comix/ui'
import { BrowserRouter } from 'react-router-dom'
import { Chrome } from './views/Chrome'

const GRAPHQL_HOST = 'http://localhost:4000/graphql'
const SUBSCRIPTIONS_HOST = 'ws://localhost:4000/subscriptions'

const httpLink = new HttpLink({
  uri: GRAPHQL_HOST
})

const wsLink = new WebSocketLink({
  uri: SUBSCRIPTIONS_HOST,
  options: {
    reconnect: true,
  },
})

const isSubscription = (query: DocumentNode) => {
  const definition = getMainDefinition(query)
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
}

const splitLink = split(({ query }) => isSubscription(query), wsLink, httpLink)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export const App = () => {
  return (
    <UiProvider client={client as any}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Chrome />
        </BrowserRouter>
      </ApolloProvider>
    </UiProvider>
  )
}
