import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { UiProvider } from '@comix/ui'
import { BrowserRouter } from 'react-router-dom'
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
        <BrowserRouter>
          <Chrome />
        </BrowserRouter>
      </ApolloProvider>
    </UiProvider>
  )
}
