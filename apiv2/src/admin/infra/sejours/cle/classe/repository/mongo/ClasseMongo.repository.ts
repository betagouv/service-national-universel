import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { ClasseGateway } from "../../../../../../core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "../../../../../../core/sejours/cle/classe/Classe.model";
import { CLASSE_MONGOOSE_ENTITY, ClasseDocument } from "../../provider/ClasseMongo.provider";
import { ClasseMapper } from "../Classe.mapper";

@Injectable()
export class ClasseRepository implements ClasseGateway {
    constructor(
        @Inject(CLASSE_MONGOOSE_ENTITY) private classeMongooseEntity: Model<ClasseDocument>,
        private readonly cls: ClsService,
    ) {}

    async create(classe: ClasseModel): Promise<ClasseModel> {
        const classeEntity = ClasseMapper.toEntity(classe);
        const createdClasse = await this.classeMongooseEntity.create(classeEntity);
        return ClasseMapper.toModel(createdClasse);
    }

    async findById(id: string): Promise<ClasseModel> {
        const classe = await this.classeMongooseEntity.findById(id);
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return ClasseMapper.toModel(classe);
    }
    async update(classe: ClasseModel): Promise<ClasseModel> {
        const classeEntity = ClasseMapper.toEntity(classe);
        const retrievedClasse = await this.classeMongooseEntity.findById(classe.id);
        if (!retrievedClasse) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        retrievedClasse.set(classeEntity);
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedClasse.save({ fromUser: user });
        return ClasseMapper.toModel(retrievedClasse);
    }

    async findAll(): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find();
        return ClasseMapper.toModels(classes);
    }
}
