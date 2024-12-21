import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { JeuneGateway } from "../../../../../core/sejours/jeune/Jeune.gateway";
import { JeuneModel } from "../../../../../core/sejours/jeune/Jeune.model";
import { JEUNE_MONGOOSE_ENTITY, JEUNE_PATCHHISTORY_OPTIONS, JeuneDocument } from "../../provider/JeuneMongo.provider";
import { JeuneMapper } from "../Jeune.mapper";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { HistoryType } from "@admin/core/history/History";
import { HistoryMapper } from "@admin/infra/history/repository/HistoryMapper";
import { HistoryGateway } from "@admin/core/history/History.gateway";

@Injectable()
export class JeuneRepository implements JeuneGateway {
    constructor(
        @Inject(JEUNE_MONGOOSE_ENTITY) private jeuneMongooseEntity: Model<JeuneDocument>,
        @Inject(HistoryGateway) private historyGateway: HistoryGateway,
        private readonly cls: ClsService,
    ) {}

    async create(jeune: JeuneModel): Promise<JeuneModel> {
        const jeuneEntity = JeuneMapper.toEntity(jeune);
        const createdJeune = await this.jeuneMongooseEntity.create(jeuneEntity);
        return JeuneMapper.toModel(createdJeune);
    }

    async findById(id: string): Promise<JeuneModel> {
        const jeune = await this.jeuneMongooseEntity.findById(id);
        if (!jeune) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return JeuneMapper.toModel(jeune);
    }

    async findBySessionIdStatusNiveauScolairesAndDepartements(
        sessionId: string,
        status: string,
        niveauScolaires: string[],
        departements: string[],
    ): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({
            cohortId: sessionId,
            status,
            grade: { $in: niveauScolaires },
            department: { $in: departements },
        });
        return JeuneMapper.toModels(jeunes);
    }

    async findBySessionId(sessionId: string): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({ cohortId: sessionId });
        return JeuneMapper.toModels(jeunes);
    }

    async update(jeune: JeuneModel): Promise<JeuneModel> {
        const jeuneEntity = JeuneMapper.toEntity(jeune);
        const retrievedJeune = await this.jeuneMongooseEntity.findById(jeune.id);
        if (!retrievedJeune) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedJeune.set(jeuneEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedJeune.save({ fromUser: user });
        return JeuneMapper.toModel(retrievedJeune);
    }

    async bulkUpdate(jeunesUpdated: JeuneModel[]): Promise<number> {
        const jeunesOriginal = await this.findByIds(jeunesUpdated.map((jeune) => jeune.id));
        if (jeunesOriginal.length !== jeunesUpdated.length) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        const jeunesEntity = jeunesUpdated.map((updated) => ({
            original: JeuneMapper.toEntity(jeunesOriginal.find(({ id }) => updated.id === id)!),
            updated: JeuneMapper.toEntity(updated),
        }));

        const user = this.cls.get("user");

        const updateJeunes = await this.jeuneMongooseEntity.bulkWrite(
            jeunesEntity.map((jeune) => ({
                updateOne: {
                    filter: { _id: jeune.updated._id },
                    update: { $set: jeune.updated },
                    upsert: false,
                },
            })),
        );

        await this.historyGateway.bulkCreate(
            HistoryType.JEUNE,
            jeunesEntity.map((jeune) =>
                HistoryMapper.toUpdateHistory(jeune.original, jeune.updated, JEUNE_PATCHHISTORY_OPTIONS, user),
            ),
        );

        return updateJeunes.modifiedCount;
    }

    async findAll(): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find();
        return JeuneMapper.toModels(jeunes);
    }

    async findByIds(ids: string[]): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({ _id: { $in: ids } });
        return JeuneMapper.toModels(jeunes);
    }

    async countAffectedByLigneDeBus(ligneDeBusId): Promise<number> {
        return this.jeuneMongooseEntity.countDocuments({
            $and: [
                {
                    status: YOUNG_STATUS.VALIDATED,
                    ligneId: ligneDeBusId,
                },
                {
                    $or: [
                        { statusPhase1: { $in: [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE] } },
                        { statusPhase1Tmp: { $in: [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE] } },
                    ],
                },
            ],
        });
    }
}
