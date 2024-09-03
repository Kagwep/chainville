import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor} from './processor'
import {District, DistrictAcquiredEvent, DistrictStateUpdatedEvent, InfrastructureBuiltEvent, WithdrawalEvent} from './model'
import { Log } from '@subsquid/evm-processor'
import { ethers } from 'ethers'

function hexToBigInt(hex: string): bigint {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    return hex ? BigInt(`0x${hex}`) : BigInt(0);
}

function hexToUint8Array(hex: string): Uint8Array {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    return Uint8Array.from(Buffer.from(hex, 'hex'));
}

const abiCoder = new ethers.AbiCoder();

processor.run(new TypeormDatabase(), async (ctx) => {
    const contractAddress = '0x4f259F00EFa16dB2e20CC6C7D1f2B0719f63ecc5'.toLowerCase()
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === contractAddress) {
                switch (log.topics[0]) {
                    case '0x4045cf77ad22993c120d887aefbe691aaef22198f2cfce69d6e84a0b4b2688f1':
                        await handleDistrictAcquired(ctx, log);
                        break;
                    case '0x682da7500ed1d681193a13a25809965530f6c712c778423543cb529e1b905cbd':
                        await handleDistrictStateUpdated(ctx, log);
                        break;
                    case '0x33a67c5b967f5238ecb43ad0b8a4218d8f9ca732b7803fa4a693586e6c22c26f':
                        await handleInfrastructureBuilt(ctx, log);
                        break;
                    case '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65':
                        await handleWithdrawal(ctx, log);
                        break;
                }
            }
        }
    }
})

async function handleDistrictAcquired(ctx: any, log: Log) {
    ctx.log.info(`DistrictAcquired Raw Data: ${log.data}`);
    
    try {
        const [x, y, metadata_url, district_name] = abiCoder.decode(
            ['uint256', 'uint256', 'string', 'string'],
            log.data
        );

        const owner = hexToUint8Array(log.topics[1]);
        const tokenId = hexToBigInt(log.topics[2]);

        ctx.log.info(`Decoded Metadata URL: ${metadata_url}`);
        ctx.log.info(`Decoded District Name: ${district_name}`);

        const event = new DistrictAcquiredEvent({
            id: log.id,
            owner,
            tokenId,
            x: BigInt(x.toString()),
            y: BigInt(y.toString()),
            metadataUrl: metadata_url,
            districtName: district_name,
            timestamp: BigInt(log.block.timestamp),
            block: BigInt(log.block.height),
            transactionHash: log.transaction?.hash || ''
        });
        await ctx.store.save(event);
    } catch (error) {
        ctx.log.error(`Error decoding DistrictAcquired event: ${error}`);
    }
}

async function handleDistrictStateUpdated(ctx: any, log: Log) {
    ctx.log.info(`DistrictStateUpdated Raw Data: ${log.data}`);
    
    try {
        const [metadata_url, stateHash, timestamp] = abiCoder.decode(
            ['string', 'bytes32', 'uint256'],
            log.data
        );

        const tokenId = hexToBigInt(log.topics[1]);

        ctx.log.info(`Decoded Metadata URL: ${metadata_url}`);

        const event = new DistrictStateUpdatedEvent({
            id: log.id,
            tokenId,
            metadataUrl: metadata_url,
            stateHash: stateHash,
            timestamp: BigInt(timestamp.toString()),
            block: BigInt(log.block.height),
            transactionHash: log.transaction?.hash || ''
        });
        await ctx.store.save(event);
    } catch (error) {
        ctx.log.error(`Error decoding DistrictStateUpdated event: ${error}`);
    }
}

async function handleInfrastructureBuilt(ctx: any, log: Log) {
    ctx.log.info(`InfrastructureBuilt Raw Data: ${log.data}`);
    
    try {
        const [infrastructureType] = abiCoder.decode(['string'], log.data);
        const tokenId = hexToBigInt(log.topics[1]);

        ctx.log.info(`Decoded Infrastructure Type: ${infrastructureType}`);

        const event = new InfrastructureBuiltEvent({
            id: log.id,
            tokenId,
            infrastructureType,
            timestamp: BigInt(log.block.timestamp),
            block: BigInt(log.block.height),
            transactionHash: log.transaction?.hash || ''
        });
        await ctx.store.save(event);
    } catch (error) {
        ctx.log.error(`Error decoding InfrastructureBuilt event: ${error}`);
    }
}

async function handleWithdrawal(ctx: any, log: Log) {
    ctx.log.info(`Withdrawal Raw Data: ${log.data}`);
    
    try {
        const [amount] = abiCoder.decode(['uint256'], log.data);
        const owner = hexToUint8Array(log.topics[1]);

        const event = new WithdrawalEvent({
            id: log.id,
            owner,
            amount: BigInt(amount.toString()),
            timestamp: BigInt(log.block.timestamp),
            block: BigInt(log.block.height),
            transactionHash: log.transaction?.hash || ''
        });
        await ctx.store.save(event);
    } catch (error) {
        ctx.log.error(`Error decoding Withdrawal event: ${error}`);
    }
}