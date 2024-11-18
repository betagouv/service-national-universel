import { Inject, Injectable } from "@nestjs/common";
import { ClasseModel } from "./Classe.model";
import { ClasseGateway } from "./Classe.gateway";

@Injectable()
export class ClasseService {
  constructor(
    @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway
  ) {}

  findAll(): Promise<ClasseModel[]> {
    return this.classeGateway.findAll();
  }
}
