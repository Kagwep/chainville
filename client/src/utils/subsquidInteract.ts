import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { District } from './types';
import { GET_ACQUIRED_DISTRICTS,GET_USER_DISTRICTS } from './query';

export const fetchDistricts = async (client: ApolloClient<any>): Promise<Map<string, District>> => {
    const result = await client.query({ query: GET_ACQUIRED_DISTRICTS });
    const districtMap = new Map<string, District>();
    result.data.districtAcquiredEvents.forEach((district: District) => {
      districtMap.set(`${district.x}_${district.y}`, district);
    });
    
    return districtMap;
  }

  export const fetchUserDistricts = async (client: ApolloClient<any>, userAddress: string): Promise<Map<string, District>> => {
    const normalizedUserAddress = normalizeAddress(userAddress);
    const result = await client.query({ query: GET_ACQUIRED_DISTRICTS });
    const districtMap = new Map<string, District>();
    result.data.districtAcquiredEvents.forEach((district: District) => {
        //district.owner = normalizeAddress(district.owner);
        console.log("jgfdhewdfy",normalizeAddress(district.owner))
        if (normalizeAddress(district.owner) === normalizedUserAddress) {
            districtMap.set(`${district.x}_${district.y}`, district);
        }
    });
    console.log(districtMap)
    return districtMap;
};

export const normalizeAddress = (address: string): string => {
    // Remove '0x' prefix if present and any leading zeros
    let cleaned = address.toLowerCase().replace(/^0x0*/, '');
    
    // Pad to 40 characters if shorter
    cleaned = cleaned.padStart(40, '0');
    
    // Add '0x' prefix back
    return '0x' + cleaned;
};