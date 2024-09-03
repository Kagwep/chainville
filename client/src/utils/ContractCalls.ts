import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESS, ChainVilleContractAbi } from '../constants'
import { ethers } from 'ethers'

export function useAcquireDistrict() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const acquireDistrict = async (x: number, y: number, metadataUrl: string, districtName: string) => {
    try {
      const result = writeContract({
          address: CONTRACT_ADDRESS,
          abi: ChainVilleContractAbi,
          functionName: 'acquireDistrict',
          args: [x, y, metadataUrl, districtName],
          value: parseEther('0.0002'), // 0.0002 ETH
      })
      return result
    } catch (err) {
      console.error('Failed to acquire district:', err)
      throw err
    }
  }

  return {
    acquireDistrict,
    isAcquiring: isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}


export function useUpdateDistrict() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const updateDistrictState = async (tokenId: number, metadataUrl: string, stateHash: string) => {
    try {

      // Ensure the stateHash is the correct length for bytes32
      if (stateHash.length !== 66) {  // 66 characters: '0x' + 64 hex characters
        throw new Error('Invalid stateHash length. Must be 32 bytes (66 characters including 0x)');
      }

      const result = writeContract({
          address: CONTRACT_ADDRESS,
          abi: ChainVilleContractAbi,
          functionName: 'updateDistrictState',
          args: [tokenId,metadataUrl, stateHash],
      })
      return result
    } catch (err) {
      console.error('Failed to acquire district:', err)
      throw err
    }
  }

  return {
    updateDistrictState,
    isUpdating: isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}