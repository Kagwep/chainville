import {EvmBatchProcessor} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'

const CONTRACT_ADDRESS = '0x4f259F00EFa16dB2e20CC6C7D1f2B0719f63ecc5'.toLowerCase()

export const processor = new EvmBatchProcessor()
    .setGateway('https://v2.archive.subsquid.io/network/base-sepolia')
    .setRpcEndpoint({
        url: 'https://base-sepolia.g.alchemy.com/v2/mf855GPjQ_iHruHq_oPrQe8VNyUQ3xSx',
        rateLimit: 10
    })
    .setFinalityConfirmation(75)
    .setBlockRange({ from: 14545358 })
    .setFields({
        log: {
            topics: true,
            data: true,
        },
        transaction: {
            from: true,
            hash: true,
        },
    })
    .addLog({
        address: [CONTRACT_ADDRESS],
        topic0: [
            '0x4045cf77ad22993c120d887aefbe691aaef22198f2cfce69d6e84a0b4b2688f1', // DistrictAcquired
            '0x682da7500ed1d681193a13a25809965530f6c712c778423543cb529e1b905cbd', // DistrictStateUpdated
            '0x33a67c5b967f5238ecb43ad0b8a4218d8f9ca732b7803fa4a693586e6c22c26f', // InfrastructureBuilt
            '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65'  // Withdrawal
        ]
    })

export const database = new TypeormDatabase()