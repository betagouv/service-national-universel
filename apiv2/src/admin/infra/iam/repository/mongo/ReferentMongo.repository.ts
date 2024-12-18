import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import {
    CreateReferentModel,
    ReferentModel,
    ReferentModelLight,
    ReferentPasswordModel,
} from "@admin/core/iam/Referent.model";
import { Inject, Injectable } from "@nestjs/common";
import { FilterQuery, ClientSession, Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { v4 as uuidv4 } from "uuid";

import { ReferentType } from "snu-lib";

import { ClockGateway } from "@shared/core/Clock.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Role, SousRole } from "@shared/core/Role";
import { ContactGateway } from "../../Contact.gateway";
import { REFERENT_MONGOOSE_ENTITY, ReferentDocument } from "../../provider/ReferentMongo.provider";
import { ReferentMapper } from "./Referent.mapper";
import { OperationType } from "@notification/infra/email/Contact";
import { CLASSE_MONGOOSE_ENTITY, ClasseDocument } from "../../../sejours/cle/classe/provider/ClasseMongo.provider";

@Injectable()
export class ReferentRepository implements ReferentGateway {
    constructor(
        @Inject(REFERENT_MONGOOSE_ENTITY) private referentMongooseEntity: Model<ReferentDocument>,
        @Inject(ContactGateway) private contactGateway: ContactGateway,
        @Inject(ClockGateway) private clockGateway: ClockGateway,
        @Inject(CLASSE_MONGOOSE_ENTITY) private classeMongooseEntity: Model<ClasseDocument>,

        private readonly cls: ClsService,
    ) {}

    async delete(id: string): Promise<void> {
        const referent = await this.referentMongooseEntity.findById(id);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        await this.updateEntity({
            _id: referent._id,
            email: `deleted-${referent.id}-${referent.email}`,
            deletedAt: this.clockGateway.now(),
        });
        this.contactGateway.syncReferent({
            ...ReferentMapper.toModel(referent),
            operation: OperationType.DELETE,
        });
        return;
    }

    async findByDepartementRoleAndSousRole(
        departement: string,
        role: Role,
        sousRole: SousRole,
    ): Promise<ReferentModel[]> {
        return this.referentMongooseEntity
            .find({ department: departement, role, subRole: sousRole })
            .then((referents) => {
                return ReferentMapper.toModels(referents);
            });
    }
    async create(referent: CreateReferentModel): Promise<ReferentModel> {
        const referentEntity = await this.referentMongooseEntity.create(ReferentMapper.toEntityCreate(referent));
        const createdReferent = ReferentMapper.toModel(referentEntity);
        await this.contactGateway.syncReferent({
            ...createdReferent,
            operation: OperationType.CREATE,
        });
        return createdReferent;
    }
    async findByIds(ids: string[]): Promise<ReferentModel[]> {
        return await this.referentMongooseEntity.find({ _id: { $in: ids } }).then((referents) => {
            return ReferentMapper.toModels(referents);
        });
    }
    async findReferentPasswordByEmail(email: string): Promise<ReferentPasswordModel> {
        const referent = await this.referentMongooseEntity.findOne({ email }).select("+password");

        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        return ReferentMapper.toModelWithPassword(referent);
    }
    async findByEmail(email: string): Promise<ReferentModel> {
        const referent = await this.referentMongooseEntity.findOne({ email });

        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        return ReferentMapper.toModel(referent);
    }
    async findById(id: string): Promise<ReferentModel> {
        return this.referentMongooseEntity.findById(id).then((referent) => {
            if (!referent) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
            }
            return ReferentMapper.toModel(referent);
        });
    }
    async update(referent: ReferentModel): Promise<ReferentModel> {
        const referentEntity = ReferentMapper.toEntity(referent);
        const updatedReferent = await this.updateEntity(referentEntity);
        this.contactGateway.syncReferent({
            ...ReferentMapper.toModel(updatedReferent),
            operation: OperationType.UPDATE,
        });
        return ReferentMapper.toModel(updatedReferent);
    }

    async findAll(): Promise<ReferentModel[]> {
        const referents = await this.referentMongooseEntity.find();
        return ReferentMapper.toModels(referents);
    }

    async generateInvitationTokenById(id: string): Promise<ReferentModel> {
        const invitationToken = uuidv4();
        const invitationExpires = this.clockGateway.addDaysToNow(50);

        const updatedReferent = await this.updateEntity({ _id: id, invitationToken, invitationExpires });
        return ReferentMapper.toModel(updatedReferent);
    }

    async findByRoleAndEtablissement(
        role: string,
        etablissementId?: string,
        search?: string,
    ): Promise<ReferentModelLight[]> {
        let referentIds: string[] = [];
        if (etablissementId) {
            const classesInEtablissement: Pick<ClasseDocument, "_id" | "referentClasseIds">[] =
                await this.classeMongooseEntity
                    .find(
                        {
                            etablissementId: etablissementId,
                            deletedAt: { $exists: false },
                        },
                        { referentClasseIds: 1 },
                    )
                    .lean();
            referentIds = [...new Set(classesInEtablissement.flatMap((classe) => classe.referentClasseIds))];
        }

        const query: FilterQuery<ReferentType> = {
            role: role,
        };

        if (etablissementId) {
            query._id = { $in: referentIds };
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        return this.referentMongooseEntity.find(query).then((referents) => {
            return referents.map((referent) => ReferentMapper.toModelLight(referent));
        });
    }

    private async updateEntity(referent: Partial<ReferentType> & Pick<ReferentType, "_id">): Promise<ReferentDocument> {
        const retrievedReferent = await this.referentMongooseEntity.findById(referent._id);
        if (!retrievedReferent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedReferent.set({ ...referent });
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedReferent.save({ fromUser: user });

        return retrievedReferent;
    }
}
