import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { HistoryDocument, mapHistory } from "./HistoryMongo.provider";
import { HistoryType } from "@admin/core/history/History";
import { PatchType } from "snu-lib";
import { HistoryGateway } from "@admin/core/history/History.gateway";

@Injectable()
export class HistoryRepository implements HistoryGateway {
    constructor(
        @Inject(mapHistory(HistoryType.JEUNE)) private readonly jeuneMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.REFERENT)) private readonly referentMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.CLASSE)) private readonly classeMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.SESSION)) private readonly sessionMongooseEntity: Model<HistoryDocument>,
    ) {}

    private getInstance(history: HistoryType) {
        switch (history) {
            case HistoryType.JEUNE:
                return this.jeuneMongooseEntity;
            case HistoryType.REFERENT:
                return this.referentMongooseEntity;
            case HistoryType.CLASSE:
                return this.classeMongooseEntity;
            case HistoryType.SESSION:
                return this.sessionMongooseEntity;
        }
    }

    async findByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType[]> {
        const instance = this.getInstance(history);
        return instance.find({ ref: referenceId });
    }
}
