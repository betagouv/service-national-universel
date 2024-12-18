import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { SESSION_MONGOOSE_ENTITY, SessionDocument } from "../../provider/SessionMongo.provider";

import { SessionMapper } from "../Session.mapper";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { CreateSessionModel, SessionModel } from "@admin/core/sejours/phase1/session/Session.model";

@Injectable()
export class SessionRepository implements SessionGateway {
    constructor(
        @Inject(SESSION_MONGOOSE_ENTITY) private sesssionMongooseEntity: Model<SessionDocument>,
        private readonly cls: ClsService,
    ) {}

    async create(session: CreateSessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntityCreate(session);
        const createdSession = await this.sesssionMongooseEntity.create(sessionEntity);
        return SessionMapper.toModel(createdSession);
    }

    async findById(id: string): Promise<SessionModel> {
        const session = await this.sesssionMongooseEntity.findById(id);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return SessionMapper.toModel(session);
    }
    async update(session: SessionModel): Promise<SessionModel> {
        const sessionEntity = SessionMapper.toEntity(session);
        const retrievedSession = await this.sesssionMongooseEntity.findById(session.id);
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
        const sessions = await this.sesssionMongooseEntity.find();
        return SessionMapper.toModels(sessions);
    }
}
