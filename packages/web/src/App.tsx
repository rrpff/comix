import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { UiProvider } from '@comix/ui'
import { Chrome } from './views/Chrome'

const GRAPHQL_HOST = 'http://localhost:4000/graphql'

const client = new ApolloClient({
  uri: GRAPHQL_HOST,
  cache: new InMemoryCache(),
})

export const App = () => {
  return (
    <UiProvider client={client as any}>
      <ApolloProvider client={client}>
        <Chrome />
      </ApolloProvider>
    </UiProvider>
  )
}
