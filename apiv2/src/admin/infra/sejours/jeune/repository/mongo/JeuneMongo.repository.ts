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
import { getEntityUpdateSetUnset } from "@shared/infra/RepositoryHelper";

@Injectable()
export class JeuneRepository implements JeuneGateway {
    constructor(
        @Inject(JEUNE_MONGOOSE_ENTITY) private jeuneMongooseEntity: Model<JeuneDocument>,
        @Inject(HistoryGateway) private historyGateway: HistoryGateway,
        private readonly cls: ClsService,
    ) {}
    async updateSession(
        jeune: Pick<
            JeuneModel,
            "id" | "sessionId" | "sessionNom" | "originalSessionId" | "originalSessionNom" | "sessionChangeReason"
        >,
    ): Promise<void> {
        await this.jeuneMongooseEntity.findByIdAndUpdate(jeune.id, {
            sessionId: jeune.sessionId,
            sessionNom: jeune.sessionNom,
            originalSessionId: jeune.originalSessionId,
            originalSessionNom: jeune.originalSessionNom,
            sessionChangeReason: jeune.sessionChangeReason,
        });
    }
    async findByClasseId(classeId: string): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({ classeId });
        return JeuneMapper.toModels(jeunes);
    }

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

    async findBySessionIdStatutNiveauScolairesAndDepartementsCible(
        sessionId: string,
        status: string,
        niveauScolaires: string[],
        departements: string[],
    ): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({
            cohortId: sessionId,
            status,
            grade: { $in: niveauScolaires },
            $or: [
                { department: { $in: departements }, schoolDepartment: { $in: departements } }, // scolarisé dans sa zone de résidence
                { department: { $in: departements }, schoolDepartment: { $exists: false } }, // non scolarisé
                { department: { $nin: departements }, schoolDepartment: { $in: departements } }, // HZR
                { department: { $in: departements }, schoolCountry: { $not: /^FRANCE$i/ } }, // etranger
            ],
        });
        return JeuneMapper.toModels(jeunes);
    }

    async findBySessionIdClasseIdAndStatus(sessionId: string, classeId: string, status: string): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({
            cohortId: sessionId,
            classeId,
            status,
        });
        return JeuneMapper.toModels(jeunes);
    }

    async findByClasseIdAndSessionId(classeId: string, sessionId: string): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({
            cohortId: sessionId,
            classeId,
        });
        return JeuneMapper.toModels(jeunes);
    }

    async findBySessionIdStatutsStatutsPhase1NiveauScolairesAndDepartements(
        sessionId: string,
        status: string[],
        statusPhase1: string[],
        niveauScolaires: string[],
        departements: Array<string | null>,
    ): Promise<JeuneModel[]> {
        const query = {
            cohortId: sessionId,
            status: { $in: status },
            grade: { $in: niveauScolaires },
            department: { $in: departements },
        };
        if (statusPhase1.length > 0) {
            query["statusPhase1"] = { $in: statusPhase1 };
        }
        const jeunes = await this.jeuneMongooseEntity.find(query);
        return JeuneMapper.toModels(jeunes);
    }

    async findByLigneDeBusIds(ligneDeBusIds: string[]): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({ ligneId: { $in: ligneDeBusIds } });
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
                    update: getEntityUpdateSetUnset(jeune.updated),
                    upsert: false,
                },
            })),
        );

        await this.historyGateway.bulkCreate(
            HistoryType.JEUNE,
            HistoryMapper.toUpdateHistories(jeunesEntity, JEUNE_PATCHHISTORY_OPTIONS, user),
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
