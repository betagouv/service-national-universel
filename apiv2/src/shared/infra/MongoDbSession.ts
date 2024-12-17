import * as mongoose from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { DbSessionGateway } from "@shared/core/DbSession.gateway";
import { DATABASE_CONNECTION } from "@infra/Database.provider";

@Injectable()
export class MongoDbSession implements DbSessionGateway<mongoose.ClientSession> {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly connection: mongoose.Connection,
    ) {}

    private session: mongoose.ClientSession | null = null;

    public async start() {
        if (this.session) {
            if (this.session.inTransaction()) {
                await this.session.abortTransaction();
                await this.session.endSession();
                throw new Error("Session already in transaction");
            }
            await this.session.endSession();
        }
        this.session = await this.connection.startSession();
        this.session.startTransaction({
            readConcern: { level: "majority" },
            writeConcern: { w: "majority" },
            readPreference: "primary",
            retryWrites: true,
        });
    }

    public async commit() {
        if (!this.session) {
            throw new Error("Session not started");
        }
        await this.session.commitTransaction();
    }

    public async end() {
        if (!this.session) {
            throw new Error("Session not started");
        }
        await this.session.endSession();
    }

    public async abort() {
        if (!this.session) {
            throw new Error("Session not started");
        }
        await this.session.abortTransaction();
    }

    public get() {
        return this.session;
    }
}
