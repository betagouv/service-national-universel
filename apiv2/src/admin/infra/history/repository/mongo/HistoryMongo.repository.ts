import { Inject, Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { HistoryDocument, mapHistory } from "./HistoryMongo.provider";
import { HistoryType } from "@admin/core/history/History";
import { PatchType } from "snu-lib";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import path from "path";

@Injectable()
export class HistoryRepository implements HistoryGateway {
    constructor(
        @Inject(mapHistory(HistoryType.JEUNE)) private readonly jeuneMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.REFERENT)) private readonly referentMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.CLASSE)) private readonly classeMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.SESSION)) private readonly sessionMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.SEJOUR)) private readonly sejourMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.LIGNEDEBUS)) private readonly ligneDeBusMongooseEntity: Model<HistoryDocument>,
        @Inject(mapHistory(HistoryType.PLANDETRANSPORT))
        private readonly planDeTransportMongooseEntity: Model<HistoryDocument>,
    ) {}
    async findLastByReferenceIdAndPath(
        history: HistoryType,
        referenceId: string,
        path: string,
    ): Promise<PatchType | null> {
        const instance = this.getInstance(history);
        return instance.findOne({ ref: referenceId, "ops.path": path }).sort({ date: -1 }).lean();
    }
    async findLastByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType | null> {
        const instance = this.getInstance(history);
        return instance.findOne({ ref: referenceId }).sort({ date: -1 }).lean();
    }
    async findLastByReferenceIdAndPathAndValue(
        history: HistoryType,
        referenceId: string,
        path: string,
        value: string,
    ): Promise<PatchType | null> {
        const instance = this.getInstance(history);
        return instance
            .findOne({
                ref: referenceId,
                "ops.path": path,
                "ops.value": value,
            })
            .sort({ date: -1 })
            .lean();
    }

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
            case HistoryType.SEJOUR:
                return this.sejourMongooseEntity;
            case HistoryType.LIGNEDEBUS:
                return this.ligneDeBusMongooseEntity;
            case HistoryType.PLANDETRANSPORT:
                return this.planDeTransportMongooseEntity;
        }
    }

    async findByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType[]> {
        const instance = this.getInstance(history);
        return instance.find({ ref: referenceId });
    }

    async bulkCreate(history: HistoryType, patches: PatchType[]): Promise<number> {
        const instance = this.getInstance(history);

        const updatePatches = await instance.bulkWrite(
            patches.map((patch) => ({
                insertOne: {
                    document: patch,
                },
            })),
        );
        return updatePatches.insertedCount;
    }

    async create(history: HistoryType, patch: PatchType): Promise<PatchType> {
        const instance = this.getInstance(history);
        return instance.create(patch);
    }
}
