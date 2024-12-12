import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { History, PatchDocument, mapHistory } from "./patchMongo.provider";

@Injectable()
export class PatchRepository {
    constructor(
        @Inject(mapHistory(History.JEUNE)) private readonly jeuneMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(History.REFERENT)) private readonly referentMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(History.CLASSE)) private readonly classeMongooseEntity: Model<PatchDocument>,
        @Inject(mapHistory(History.SESSION)) private readonly sessionMongooseEntity: Model<PatchDocument>,
    ) {}

    private getInstance(history: History) {
        switch (history) {
            case History.JEUNE:
                return this.jeuneMongooseEntity;
            case History.REFERENT:
                return this.referentMongooseEntity;
            case History.CLASSE:
                return this.classeMongooseEntity;
            case History.SESSION:
                return this.sessionMongooseEntity;
        }
    }

    async findByReferenceId(history: History, referenceId: string): Promise<PatchDocument[]> {
        const instance = this.getInstance(history);
        return instance.find({ ref: referenceId });
    }
}
