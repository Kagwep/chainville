import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Infrastructure} from "./infrastructure.model"

@Entity_()
export class District {
    constructor(props?: Partial<District>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("bytea", {nullable: false})
    owner!: Uint8Array

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    tokenId!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    x!: bigint

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    y!: bigint

    @Column_("text", {nullable: false})
    metadataUrl!: string

    @Column_("text", {nullable: false})
    districtName!: string

    @Column_("bytea", {nullable: true})
    stateHash!: Uint8Array | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    lastUpdate!: bigint | undefined | null

    @OneToMany_(() => Infrastructure, e => e.district)
    infrastructures!: Infrastructure[]
}
