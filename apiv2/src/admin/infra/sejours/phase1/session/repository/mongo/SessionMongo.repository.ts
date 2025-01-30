import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { SESSION_MONGOOSE_ENTITY, SessionDocument } from "../../provider/SessionMongo.provider";

import { SessionMapper } from "../Session.mapper";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { CreateSessionModel, SessionModel } from "@admin/core/sejours/phase1/session/Session.model";
import { COHORT_TYPE, COHORT_STATUS } from "snu-lib";

@Injectable()
export class SessionRepository implements SessionGateway {
    constructor(
        @Inject(SESSION_MONGOOSE_ENTITY) private sessionMongooseEntity: Model<SessionDocument>,
        private readonly cls: ClsService,
    ) {}
    async findBySnuId(snuId: string): Promise<SessionModel | null> {
        const session = await this.sessionMongooseEntity.findOne({ snuId });
        if (!session) {
            return null;
        }
        return SessionMapper.toModel(session);
    }

    async create(session: CreateSessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntityCreate(session);
        const createdSession = await this.sessionMongooseEntity.create(sessionEntity);
        return SessionMapper.toModel(createdSession);
    }

    async findById(id: string): Promise<SessionModel> {
        const session = await this.sessionMongooseEntity.findById(id);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SessionMapper.toModel(session);
    }
    async update(session: SessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntity(session);
        const retrievedSession = await this.sessionMongooseEntity.findById(session.id);
        if (!retrievedSession) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedSession.set(sessionEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedSession.save({ fromUser: user });
        return SessionMapper.toModel(retrievedSession);
    }

    async findAll(): Promise<SessionModel[]> {
        const sessions = await this.sessionMongooseEntity.find();
        return SessionMapper.toModels(sessions);
    }

    async findByElligibility(
        type: keyof typeof COHORT_TYPE,
        statut: keyof typeof COHORT_STATUS,
    ): Promise<SessionModel[]> {
        const sessions = await this.sessionMongooseEntity.find({ type, statut });
        if (!sessions || sessions.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SessionMapper.toModels(sessions);
    }
}
