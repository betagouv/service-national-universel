import { Inject, Injectable } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { ClasseGateway } from "../../../../../../core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "../../../../../../core/sejours/cle/classe/Classe.model";
import { CLASSE_MONGOOSE_ENTITY, ClasseDocument } from "../../provider/ClasseMongo.provider";
import { ClasseMapper } from "../Classe.mapper";
import { STATUS_CLASSE } from "snu-lib";

@Injectable()
export class ClasseRepository implements ClasseGateway {
    constructor(
        @Inject(CLASSE_MONGOOSE_ENTITY) private classeMongooseEntity: Model<ClasseDocument>,

        private readonly cls: ClsService,
    ) {}
    async findByIds(ids: string[]): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find({ _id: { $in: ids } });
        return ClasseMapper.toModels(classes);
    }

    async updateStatut(classeId: string, statut: keyof typeof STATUS_CLASSE): Promise<ClasseModel> {
        const classe = await this.classeMongooseEntity.findByIdAndUpdate(classeId, { status: statut });
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return ClasseMapper.toModel(classe);
    }

    async findByReferentId(referentId: string): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find({ referentClasseIds: [referentId] });
        return ClasseMapper.toModels(classes);
    }

    async findReferentIdsByClasseIds(classeIds: string[]): Promise<string[]> {
        const classes = await this.classeMongooseEntity.find({ _id: { $in: classeIds } });
        return [...new Set(classes.flatMap((classe) => classe.referentClasseIds))];
    }

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
        // Le modèle historique prévoit une liste de référents, mais il ne doit y en avoir qu'un
        if (classe.referentClasseIds.length > 1) {
            throw new FunctionalException(FunctionalExceptionCode.TOO_MANY_REFERENTS_CLASSE);
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
        retrievedClasse.set("updatedAt", new Date());
        const user = this.cls.get("user");

        //@ts-expect-error fromUser unknown
        await retrievedClasse.save({ fromUser: user });
        return ClasseMapper.toModel(retrievedClasse);
    }

    // TODO : remove after testing
    async findAll(): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find({}, { academy: 1, coloration: 1, name: 1 });
        return ClasseMapper.toModels(classes);
    }

    async findByLigneDeBusIds(ids: string[]): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find({ ligneId: { $in: ids } });
        return ClasseMapper.toModels(classes);
    }

    async findBySessionIdAndDepartmentNotWithdrawn(sessionId: string, departements: string[]): Promise<ClasseModel[]> {
        const classes = await this.classeMongooseEntity.find({
            cohortId: sessionId,
            status: { $nin: [STATUS_CLASSE.WITHDRAWN] },
            department: { $in: departements },
        });
        return ClasseMapper.toModels(classes);
    }

    async updatePlacesPrises(classeId: string, placesPrises: number): Promise<ClasseModel> {
        const classe = await this.classeMongooseEntity.findByIdAndUpdate(
            classeId,
            { seatsTaken: placesPrises },
            { new: true },
        );
        if (!classe) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return ClasseMapper.toModel(classe);
    }
}
