import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

export const GET_ACQUIRED_DISTRICTS = gql`
  query GET_ACQUIRED_DISTRICTS {
    districtAcquiredEvents {
      id
      metadataUrl
      owner
      timestamp
      tokenId
      transactionHash
      x
      y
      districtName
    }
  }
`;

export const GET_USER_DISTRICTS = gql`
  query GET_USER_DISTRICTS{
  districtAcquiredEvents {
    id
    metadataUrl
    owner
    timestamp
    tokenId
    transactionHash
    x
    y
    districtName
  }
  }
`;