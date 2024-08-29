import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class DistrictStateUpdatedEvent {
    constructor(props?: Partial<DistrictStateUpdatedEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    tokenId!: bigint

    @Column_("text", {nullable: false})
    metadataUrl!: string

    @Column_("bytea", {nullable: false})
    stateHash!: Uint8Array

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    block!: bigint

    @Column_("text", {nullable: false})
    transactionHash!: string
}
