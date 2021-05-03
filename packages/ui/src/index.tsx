import { ApolloProvider, ApolloClient } from '@apollo/client'
import React, { ReactNode } from 'react'

export * from './types/apiSchema'

export interface UiProviderProps<TCache> {
  client: ApolloClient<TCache>
  children: ReactNode
}

export function UiProvider<TCache>({ children, ...props }: UiProviderProps<TCache>) {
  return (
    <ApolloProvider {...props}>
      {children}
    </ApolloProvider>
  )
}
