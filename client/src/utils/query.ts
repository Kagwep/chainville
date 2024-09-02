import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

export const GET_ACQUIRED_DISTRICTS = gql`
  query GET_ACQUIRED_DISTRICTS {
    districts {
      id
      owner
      tokenId
      x
      y
      metadataUrl
      districtName
      lastUpdate
    }
  }
`;

export const GET_USER_DISTRICTS = gql`
  query GET_USER_DISTRICTS($owner: String!) {
    districts(where: { owner: $owner }) {
      id
      owner
      tokenId
      x
      y
      metadataUrl
      districtName
      lastUpdate
      stateHash
    }
  }
`;