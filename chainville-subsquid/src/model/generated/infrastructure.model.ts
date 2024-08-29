import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {District} from "./district.model"

@Entity_()
export class Infrastructure {
    constructor(props?: Partial<Infrastructure>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => District, {nullable: true})
    district!: District

    @Column_("text", {nullable: false})
    infrastructureType!: string
}
