import { Buffer } from 'buffer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx'
import { config } from './wagmi.ts'
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

import './index.css'

globalThis.Buffer = Buffer

// Setup Apollo Client
const client = new ApolloClient({
  uri: 'https://92b4fce6-8879-4e64-9ae5-56c20f27f8ef.squids.live/transactions-example/v/v1/graphql',
  cache: new InMemoryCache()
});

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
