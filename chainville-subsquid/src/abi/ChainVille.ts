import * as p from '@subsquid/evm-codec'
import { event, fun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    DistrictAcquired: event("0x4045cf77ad22993c120d887aefbe691aaef22198f2cfce69d6e84a0b4b2688f1", 'DistrictAcquired(address,uint256,uint256,uint256,string,string)', {
        "owner": indexed(p.address),
        "tokenId": indexed(p.uint256),
        "x": p.uint256,
        "y": p.uint256,
        "metadata_url": p.string,
        "district_name": p.string
    }),
    DistrictStateUpdated: event("0x682da7500ed1d681193a13a25809965530f6c712c778423543cb529e1b905cbd", 'DistrictStateUpdated(uint256,string,bytes32,uint256)', {
        "tokenId": indexed(p.uint256),
        "metadata_url": p.string,
        "stateHash": p.bytes32,
        "timestamp": p.uint256
    }),
    InfrastructureBuilt: event("0x33a67c5b967f5238ecb43ad0b8a4218d8f9ca732b7803fa4a693586e6c22c26f", 'InfrastructureBuilt(uint256,string)', {
        "tokenId": indexed(p.uint256),
        "infrastructureType": p.string
    }),
    Withdrawal: event("0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65", 'Withdrawal(address,uint256)', {
        "owner": indexed(p.address),
        "amount": p.uint256
    }),
}

export const functions = {
    acquireDistrict: fun('89188dc4', 'acquireDistrict(uint256,uint256,string,string)', {
        x: p.uint256,
        y: p.uint256,
        metadata_url: p.string,
        district_name: p.string
    }, p.uint256),
    buildInfrastructure: fun('3afbf65a', 'buildInfrastructure(uint256,string)', {
        tokenId: p.uint256,
        infrastructureType: p.string
    }, undefined),
    districtPrice: fun('fd58c368', 'districtPrice()', {}, p.uint256),
    getDistrictDetails: fun('163a7bd6', 'getDistrictDetails(uint256)', {tokenId: p.uint256}, (p.uint256, p.uint256, p.string, p.string, p.bytes32, p.uint256)),
    getDistrictVersion: fun('8f64a3ce', 'getDistrictVersion(uint256)', {tokenId: p.uint256}, p.uint256),
    getDistrictsByOwner: fun('ca5bc354', 'getDistrictsByOwner(address)', {owner: p.address}, p.array(p.uint256)),
    getTokenIdByCoordinates: fun('759eeb88', 'getTokenIdByCoordinates(uint256,uint256)', {x: p.uint256, y: p.uint256}, p.uint256),
    isDistrictAcquired: fun('d11cab46', 'isDistrictAcquired(uint256,uint256)', {x: p.uint256, y: p.uint256}, p.bool),
    mergeDistricts: fun('c963fde2', 'mergeDistricts(uint256[],string,string)', {
        tokenIds: p.array(p.uint256),
        metadata_url: p.string,
        district_name: p.string
    }, p.uint256),
    setDistrictPrice: fun('8c32f1f1', 'setDistrictPrice(uint256)', {price: p.uint256}, undefined),
    updateDistrictState: fun('5ab8e69c', 'updateDistrictState(uint256,string,bytes32)', {
        tokenId: p.uint256,
        metadata_url: p.string,
        stateHash: p.bytes32
    }, undefined),
    withdraw: fun('2e1a7d4d', 'withdraw(uint256)', {amount: p.uint256}, undefined),
}

export class Contract extends ContractBase {
    acquireDistrict(x: bigint, y: bigint, metadata_url: string, district_name: string) {
        return this.eth_call(functions.acquireDistrict, {x, y, metadata_url, district_name})
    }

    buildInfrastructure(tokenId: bigint, infrastructureType: string) {
        return this.eth_call(functions.buildInfrastructure, {tokenId, infrastructureType})
    }

    districtPrice() {
        return this.eth_call(functions.districtPrice, {})
    }

    getDistrictDetails(tokenId: bigint) {
        return this.eth_call(functions.getDistrictDetails, {tokenId})
    }

    getDistrictVersion(tokenId: bigint) {
        return this.eth_call(functions.getDistrictVersion, {tokenId})
    }

    getDistrictsByOwner(owner: string) {
        return this.eth_call(functions.getDistrictsByOwner, {owner})
    }

    getTokenIdByCoordinates(x: bigint, y: bigint) {
        return this.eth_call(functions.getTokenIdByCoordinates, {x, y})
    }

    isDistrictAcquired(x: bigint, y: bigint) {
        return this.eth_call(functions.isDistrictAcquired, {x, y})
    }

    mergeDistricts(tokenIds: bigint[], metadata_url: string, district_name: string) {
        return this.eth_call(functions.mergeDistricts, {tokenIds, metadata_url, district_name})
    }

    setDistrictPrice(price: bigint) {
        return this.eth_call(functions.setDistrictPrice, {price})
    }

    updateDistrictState(tokenId: bigint, metadata_url: string, stateHash: Uint8Array) {
        return this.eth_call(functions.updateDistrictState, {tokenId, metadata_url, stateHash})
    }

    withdraw(amount: bigint) {
        return this.eth_call(functions.withdraw, {amount})
    }
}

// Event types
export type DistrictAcquiredEventArgs = EParams<typeof events.DistrictAcquired>
export type DistrictStateUpdatedEventArgs = EParams<typeof events.DistrictStateUpdated>
export type InfrastructureBuiltEventArgs = EParams<typeof events.InfrastructureBuilt>
export type WithdrawalEventArgs = EParams<typeof events.Withdrawal>

// Function types
export type AcquireDistrictParams = FunctionArguments<typeof functions.acquireDistrict>
export type AcquireDistrictReturn = FunctionReturn<typeof functions.acquireDistrict>

export type BuildInfrastructureParams = FunctionArguments<typeof functions.buildInfrastructure>
export type BuildInfrastructureReturn = FunctionReturn<typeof functions.buildInfrastructure>

export type DistrictPriceParams = FunctionArguments<typeof functions.districtPrice>
export type DistrictPriceReturn = FunctionReturn<typeof functions.districtPrice>

export type GetDistrictDetailsParams = FunctionArguments<typeof functions.getDistrictDetails>
export type GetDistrictDetailsReturn = FunctionReturn<typeof functions.getDistrictDetails>

export type GetDistrictVersionParams = FunctionArguments<typeof functions.getDistrictVersion>
export type GetDistrictVersionReturn = FunctionReturn<typeof functions.getDistrictVersion>

export type GetDistrictsByOwnerParams = FunctionArguments<typeof functions.getDistrictsByOwner>
export type GetDistrictsByOwnerReturn = FunctionReturn<typeof functions.getDistrictsByOwner>

export type GetTokenIdByCoordinatesParams = FunctionArguments<typeof functions.getTokenIdByCoordinates>
export type GetTokenIdByCoordinatesReturn = FunctionReturn<typeof functions.getTokenIdByCoordinates>

export type IsDistrictAcquiredParams = FunctionArguments<typeof functions.isDistrictAcquired>
export type IsDistrictAcquiredReturn = FunctionReturn<typeof functions.isDistrictAcquired>

export type MergeDistrictsParams = FunctionArguments<typeof functions.mergeDistricts>
export type MergeDistrictsReturn = FunctionReturn<typeof functions.mergeDistricts>

export type SetDistrictPriceParams = FunctionArguments<typeof functions.setDistrictPrice>
export type SetDistrictPriceReturn = FunctionReturn<typeof functions.setDistrictPrice>

export type UpdateDistrictStateParams = FunctionArguments<typeof functions.updateDistrictState>
export type UpdateDistrictStateReturn = FunctionReturn<typeof functions.updateDistrictState>

export type WithdrawParams = FunctionArguments<typeof functions.withdraw>
export type WithdrawReturn = FunctionReturn<typeof functions.withdraw>