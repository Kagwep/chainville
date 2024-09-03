module.exports = class Data1725383901314 {
    name = 'Data1725383901314'

    async up(db) {
        await db.query(`CREATE TABLE "infrastructure" ("id" character varying NOT NULL, "infrastructure_type" text NOT NULL, "district_id" character varying, CONSTRAINT "PK_8161b97846571f8e8b062ea8ec6" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_bbfd93c6b1f334cbb652fb4053" ON "infrastructure" ("district_id") `)
        await db.query(`CREATE TABLE "district" ("id" character varying NOT NULL, "owner" bytea NOT NULL, "token_id" numeric NOT NULL, "x" numeric NOT NULL, "y" numeric NOT NULL, "metadata_url" text NOT NULL, "district_name" text NOT NULL, "state_hash" bytea, "last_update" numeric, CONSTRAINT "PK_ee5cb6fd5223164bb87ea693f1e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "district_acquired_event" ("id" character varying NOT NULL, "owner" bytea NOT NULL, "token_id" numeric NOT NULL, "x" numeric NOT NULL, "y" numeric NOT NULL, "metadata_url" text NOT NULL, "district_name" text NOT NULL, "timestamp" numeric NOT NULL, "block" numeric NOT NULL, "transaction_hash" text NOT NULL, CONSTRAINT "PK_fd88d94f84b1524e9ba08a695f6" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "district_state_updated_event" ("id" character varying NOT NULL, "token_id" numeric NOT NULL, "metadata_url" text NOT NULL, "state_hash" bytea NOT NULL, "timestamp" numeric NOT NULL, "block" numeric NOT NULL, "transaction_hash" text NOT NULL, CONSTRAINT "PK_a2bfa7a3668cfb11e78bb50c078" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "infrastructure_built_event" ("id" character varying NOT NULL, "token_id" numeric NOT NULL, "infrastructure_type" text NOT NULL, "timestamp" numeric NOT NULL, "block" numeric NOT NULL, "transaction_hash" text NOT NULL, CONSTRAINT "PK_d7feb480b1efdbb51a02978704d" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "withdrawal_event" ("id" character varying NOT NULL, "owner" bytea NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block" numeric NOT NULL, "transaction_hash" text NOT NULL, CONSTRAINT "PK_23891a284a0acfaf2788ebc7a89" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "infrastructure" ADD CONSTRAINT "FK_bbfd93c6b1f334cbb652fb4053d" FOREIGN KEY ("district_id") REFERENCES "district"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "infrastructure"`)
        await db.query(`DROP INDEX "public"."IDX_bbfd93c6b1f334cbb652fb4053"`)
        await db.query(`DROP TABLE "district"`)
        await db.query(`DROP TABLE "district_acquired_event"`)
        await db.query(`DROP TABLE "district_state_updated_event"`)
        await db.query(`DROP TABLE "infrastructure_built_event"`)
        await db.query(`DROP TABLE "withdrawal_event"`)
        await db.query(`ALTER TABLE "infrastructure" DROP CONSTRAINT "FK_bbfd93c6b1f334cbb652fb4053d"`)
    }
}
