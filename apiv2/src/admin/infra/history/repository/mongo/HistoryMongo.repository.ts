import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { HistoryType, PatchDocument, mapHistory } from "./historyMongo.provider";
import { PatchType } from "snu-lib";

@Injectable()
export class HistoryRepository {
    constructor(
        @Inject(mapHistory(HistoryType.JEUNE)) private readonly jeuneMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(HistoryType.REFERENT)) private readonly referentMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(HistoryType.CLASSE)) private readonly classeMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(HistoryType.SESSION)) private readonly sessionMongooseEntity: Model<PatchDocument>,
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
