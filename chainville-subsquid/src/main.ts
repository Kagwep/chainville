import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor} from './processor'
import {District, DistrictAcquiredEvent, DistrictStateUpdatedEvent, InfrastructureBuiltEvent, WithdrawalEvent} from './model'
import { ethers } from 'ethers';

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

processor.run(new TypeormDatabase(), async (ctx) => {
    const contractAddress = '0x4f259F00EFa16dB2e20CC6C7D1f2B0719f63ecc5'.toLowerCase()
    
    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address === contractAddress) {
                switch (log.topics[0]) {
                    case '0x4045cf77ad22993c120d887aefbe691aaef22198f2cfce69d6e84a0b4b2688f1':
                        await handleDistrictAcquired(ctx, log, block);
                        break;
                    case '0x682da7500ed1d681193a13a25809965530f6c712c778423543cb529e1b905cbd':
                        await handleDistrictStateUpdated(ctx, log, block);
                        break;
                    case '0x33a67c5b967f5238ecb43ad0b8a4218d8f9ca732b7803fa4a693586e6c22c26f':
                        await handleInfrastructureBuilt(ctx, log, block);
                        break;
                    case '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65':
                        await handleWithdrawal(ctx, log, block);
                        break;
                }
            }
        }
    }
})

async function handleDistrictAcquired(ctx: any, log: any, block: any) {
    const owner = hexToUint8Array(log.topics[1]);
    const tokenId = hexToBigInt(log.topics[2]);
    const x = hexToBigInt(log.data.slice(0, 66));
    const y = hexToBigInt('0x' + log.data.slice(66, 130))
    const metadata_url = safeDecodeBytes('0x' + log.data.slice(130, 194));
    const district_name = safeDecodeBytes('0x' + log.data.slice(194));


    const district = new District({
        id: tokenId.toString(),
        owner,
        tokenId: tokenId,
        x,
        y,
        metadataUrl: metadata_url,
        districtName: district_name,
        lastUpdate: BigInt(block.header.timestamp)
    });
    await ctx.store.save(district);

    const event = new DistrictAcquiredEvent({
        id: log.id,
        owner,
        tokenId,
        x,
        y,
        metadataUrl: metadata_url,
        districtName: district_name,
        timestamp: BigInt(block.header.timestamp),
        block: BigInt(block.header.height),
        transactionHash: log.transaction?.hash || ''
    });
    await ctx.store.save(event);
}

async function handleDistrictStateUpdated(ctx: any, log: any, block: any) {
    const tokenId = hexToBigInt(log.topics[1]);
    const metadata_url = safeDecodeBytes(log.data.slice(0, 66));
    const stateHash = hexToUint8Array('0x' + log.data.slice(66, 130));
    const timestamp = hexToBigInt('0x' + log.data.slice(130));

    const district = await ctx.store.get(District, tokenId.toString());
    if (district) {
        district.metadataUrl = metadata_url;
        district.stateHash = stateHash;
        district.lastUpdate = timestamp;
        await ctx.store.save(district);
    }

    const event = new DistrictStateUpdatedEvent({
        id: log.id,
        tokenId,
        metadataUrl: metadata_url,
        stateHash,
        timestamp,
        block: BigInt(block.header.height),
        transactionHash: log.transaction?.hash || ''
    });
    await ctx.store.save(event);
}

async function handleInfrastructureBuilt(ctx: any, log: any, block: any) {
    const tokenId = hexToBigInt(log.topics[1]);
    const infrastructureType = safeDecodeBytes(log.data);

    const event = new InfrastructureBuiltEvent({
        id: log.id,
        tokenId,
        infrastructureType,
        timestamp: BigInt(block.header.timestamp),
        block: BigInt(block.header.height),
        transactionHash: log.transaction?.hash || ''
    });
    await ctx.store.save(event);
}

async function handleWithdrawal(ctx: any, log: any, block: any) {
    const owner = hexToUint8Array(log.topics[1]);
    const amount = hexToBigInt(log.data);

    const event = new WithdrawalEvent({
        id: log.id,
        owner,
        amount,
        timestamp: BigInt(block.header.timestamp),
        block: BigInt(block.header.height),
        transactionHash: log.transaction?.hash || ''
    });
    await ctx.store.save(event);
}

function safeDecodeBytes(bytes: string): string {
    try {
        // Remove '0x' prefix if present
        const cleanHex = bytes.startsWith('0x') ? bytes.slice(2) : bytes;
        
        // Convert hex to Uint8Array
        const uint8Array = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        
        // Find the index of the first zero byte (null terminator)
        const nullTerminatorIndex = uint8Array.indexOf(0);
        
        // Slice the array up to the null terminator (or use the whole array if no null terminator)
        const slicedArray = nullTerminatorIndex !== -1 ? uint8Array.slice(0, nullTerminatorIndex) : uint8Array;
        
        // Decode the sliced array to UTF-8 string
        return ethers.toUtf8String(slicedArray);
    } catch (error) {
        console.error('Error decoding bytes to string:', error);
        return ''; // Return empty string in case of error
    }
}