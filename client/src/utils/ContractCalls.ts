import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESS, ChainVilleContractAbi } from '../constants'

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