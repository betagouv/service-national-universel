import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";

import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { CreateSessionModel, SessionModel } from "@admin/core/sejours/phase1/session/Session.model";
import { ClockGateway } from "@shared/core/Clock.gateway";

import { SESSION_MONGOOSE_ENTITY, SessionDocument } from "../../provider/SessionMongo.provider";
import { SessionMapper } from "../Session.mapper";

@Injectable()
export class SessionRepository implements SessionGateway {
    constructor(
        @Inject(SESSION_MONGOOSE_ENTITY) private sesssionMongooseEntity: Model<SessionDocument>,
        @Inject(ClockGateway) private clockGateway: ClockGateway,
        private readonly cls: ClsService,
    ) {}
    async findBySnuId(snuId: string): Promise<SessionModel | null> {
        const session = await this.sesssionMongooseEntity.findOne({ snuId });
        if (!session) {
            return null;
        }
        return SessionMapper.toModel(session);
    }

    async create(session: CreateSessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntityCreate(session);
        const createdSession = await this.sesssionMongooseEntity.create(sessionEntity);
        return SessionMapper.toModel(createdSession);
    }

    async findById(id: string): Promise<SessionModel> {
        const session = await this.sesssionMongooseEntity.findById(id);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `session ${id}`);
        }
        return SessionMapper.toModel(session);
    }
    async findByName(name: string): Promise<SessionModel> {
        const session = await this.sesssionMongooseEntity.findOne({ name });
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SessionMapper.toModel(session);
    }

    async findByGroupIdStatusAndEligibility(
        status: string,
        cohortGroupId: string,
        {
            dateNaissance,
            niveauScolaire,
            departement,
        }: { dateNaissance: Date; niveauScolaire: string; departement: string },
    ): Promise<SessionModel[]> {
        const sessions = await this.sesssionMongooseEntity.find({
            status,
            cohortGroupId,
            "eligibility.zones": departement,
            "eligibility.schoolLevels": niveauScolaire,
            "eligibility.bornAfter": { $lte: dateNaissance },
            "eligibility.bornBefore": { $gte: this.clockGateway.addHours(dateNaissance, -11) },
        });
        return SessionMapper.toModels(sessions);
    }

    async findByDateEndAfter(date: Date): Promise<SessionModel[]> {
        const sessions = await this.sesssionMongooseEntity.find({ dateEnd: { $gte: date } });
        return SessionMapper.toModels(sessions);
    }

    async update(session: SessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntity(session);
        const retrievedSession = await this.sesssionMongooseEntity.findById(session.id);
        if (!retrievedSession) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedSession.set(sessionEntity);
        retrievedSession.set("updatedAt", new Date());
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedSession.save({ fromUser: user });
        return SessionMapper.toModel(retrievedSession);
    }

    async findAll(): Promise<SessionModel[]> {
        const sessions = await this.sesssionMongooseEntity.find();
        return SessionMapper.toModels(sessions);
    }
}
