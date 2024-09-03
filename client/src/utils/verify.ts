import { keccak256, encodePacked } from 'viem';
import { useSignMessage } from 'wagmi';

async function verifyMetadata(
  ipfsUrl: string, 
  originalStateHash: `0x${string}`,
  address: `0x${string}`,
  signMessageAsync: ReturnType<typeof useSignMessage>['signMessageAsync']
): Promise<boolean> {
  try {
    // Fetch the metadata from IPFS
    const response = await fetch(ipfsUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata from IPFS');
    }
    const jsonData = await response.text();

    // Recreate the message that was originally signed
    const message = `Update district state: ${jsonData}`;

    // Re-sign the message
    const signature = await signMessageAsync({message});

    // Recreate the hash
    const recreatedHash = keccak256(
      encodePacked(
        ['string', 'address', 'bytes'],
        [jsonData, address, signature]
      )
    );

    // Compare the recreated hash with the original hash
    return recreatedHash === originalStateHash;
  } catch (error) {
    console.error('Error verifying metadata:', error);
    return false;
  }
}

export default verifyMetadata;