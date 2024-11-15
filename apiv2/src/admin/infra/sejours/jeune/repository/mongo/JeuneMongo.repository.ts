import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { JeuneGateway } from "../../../../../core/sejours/jeune/Jeune.gateway";
import { JeuneModel } from "../../../../../core/sejours/jeune/Jeune.model";
import { JEUNE_MONGOOSE_ENTITY, JeuneDocument } from "../../provider/JeuneMongo.provider";
import { JeuneMapper } from "../Jeune.mapper";

@Injectable()
export class JeuneRepository implements JeuneGateway {
    constructor(
        @Inject(JEUNE_MONGOOSE_ENTITY) private jeuneMongooseEntity: Model<JeuneDocument>,
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

    async findBySessionIdAndStatusForDepartementMetropole(sessionId: string, status: string): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find({ cohortId: sessionId, status });
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

    async findAll(): Promise<JeuneModel[]> {
        const jeunes = await this.jeuneMongooseEntity.find();
        return JeuneMapper.toModels(jeunes);
    }
}
