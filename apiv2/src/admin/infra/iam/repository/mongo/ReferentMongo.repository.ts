import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ReferentGateway, Role, SousRole } from "src/admin/core/iam/Referent.gateway";
import { ReferentModel, ReferentPasswordModel } from "src/admin/core/iam/Referent.model";
import { v4 as uuidv4 } from "uuid";
import { ContactGateway } from "../../Contact.gateway";
import { REFERENT_MONGOOSE_ENTITY, ReferentDocument } from "../../provider/ReferentMongo.provider";
import { ReferentMapper } from "./Referent.mapper";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClsService } from "nestjs-cls";
import { ReferentType } from "snu-lib";

@Injectable()
export class ReferentRepository implements ReferentGateway {
    constructor(
        @Inject(REFERENT_MONGOOSE_ENTITY) private referentMongooseEntity: Model<ReferentDocument>,
        @Inject(ContactGateway) private contactGateway: ContactGateway,
        @Inject(ClockGateway) private clockGateway: ClockGateway,
        private readonly cls: ClsService,
    ) {}

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
    async create(referent: ReferentModel): Promise<ReferentModel> {
        return await this.referentMongooseEntity.create(ReferentMapper.toEntity(referent)).then((referentEntity) => {
            this.contactGateway.syncReferent(ReferentMapper.toModel(referentEntity));
            return ReferentMapper.toModel(referentEntity);
        });
    }
    async findByIds(ids: string[]): Promise<ReferentModel[]> {
        return await this.referentMongooseEntity.find({ _id: { $in: ids } }).then((referents) => {
            return ReferentMapper.toModels(referents);
        });
    }
    async findByEmail(email: string): Promise<ReferentPasswordModel> {
        // return await this.referentMongooseEntity.findOne({ email });
        const referent = await this.referentMongooseEntity.findOne({ email }).select("+password");
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return ReferentMapper.toModelWithPassword(referent);
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

    private async updateEntity(referent: Partial<ReferentType> & Pick<ReferentType, "_id">): Promise<ReferentDocument> {
        const retrievedReferent = await this.referentMongooseEntity.findById(referent._id);
        if (!retrievedReferent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedReferent.set({ ...referent });
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedReferent.save({ fromUser: user });

        this.contactGateway.syncReferent(ReferentMapper.toModel(retrievedReferent));

        return retrievedReferent;
    }
}
