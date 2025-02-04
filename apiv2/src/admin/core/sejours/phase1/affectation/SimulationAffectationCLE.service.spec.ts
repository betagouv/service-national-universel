import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { FileGateway } from "@shared/core/File.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SimulationAffectationCLEService } from "./SimulationAffectationCLE.service";

import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { EtablissementGateway } from "../../cle/etablissement/Etablissement.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";
import { ClasseModel } from "../../cle/classe/Classe.model";
import { SejourModel } from "../sejour/Sejour.model";

describe("SimulationAffectationCLEService", () => {
    let simulationAffectationCLEservice: SimulationAffectationCLEService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulationAffectationCLEService,
                Logger,
                {
                    provide: JeuneGateway,
                    useValue: {},
                },
                {
                    provide: SejourGateway,
                    useValue: {},
                },
                {
                    provide: ClasseGateway,
                    useValue: {},
                },
                {
                    provide: EtablissementGateway,
                    useValue: {},
                },
                {
                    provide: ReferentGateway,
                    useValue: {},
                },
                {
                    provide: FileGateway,
                    useValue: {},
                },
            ],
        }).compile();

        simulationAffectationCLEservice = module.get<SimulationAffectationCLEService>(SimulationAffectationCLEService);
    });

    describe("checkPlacesRestantesCentre", () => {
        it("should return false and add error to classeErreurList if placesRestantes is less than jeunesList length", () => {
            const resultats = {
                sejourList: [],
                classeErreurList: [],
            };
            const jeunesList = [{ id: "1" }, { id: "2" }, { id: "3" }] as JeuneModel[];
            const classe = { id: "1", nom: "Classe A" } as ClasseModel;
            const sejour = { id: "1", placesRestantes: 2, placesTotal: 10 } as SejourModel;

            const result = simulationAffectationCLEservice.checkPlacesRestantesCentre(
                resultats,
                jeunesList,
                classe,
                sejour,
            );

            expect(result).toBe(false);
            expect(resultats.classeErreurList).toHaveLength(1);
            expect(resultats.classeErreurList[0]).toEqual({
                message: "La capacité de la session est trop faible",
                classe,
                ligneBus: undefined,
                sejour,
                jeunesNombre: jeunesList.length,
            });
        });

        it("should update sejourList if placesRestantes is sufficient", () => {
            const resultats = {
                sejourList: [],
                classeErreurList: [],
            };
            const jeunesList = [{ id: "1" }, { id: "2" }] as JeuneModel[];
            const classe = { id: "1", nom: "Classe A" } as ClasseModel;
            const sejour = { id: "1", placesRestantes: 5, placesTotal: 10 } as SejourModel;

            const result = simulationAffectationCLEservice.checkPlacesRestantesCentre(
                resultats,
                jeunesList,
                classe,
                sejour,
            );

            expect(result).toBe(true);
            expect(resultats.sejourList).toHaveLength(1);
            expect(resultats.sejourList[0]).toEqual({
                sejour,
                placeOccupees: 7,
                placeRestantes: 3,
            });
        });

        it("should update existing sejour in sejourList if placesRestantes is sufficient", () => {
            const sejour = { id: "1", placesRestantes: 5, placesTotal: 10 } as SejourModel;
            const resultats = {
                sejourList: [{ sejour, placeOccupees: 2, placeRestantes: 5 }],
                classeErreurList: [],
            };
            const jeunesList = [{ id: "1" }, { id: "2" }] as JeuneModel[];
            const classe = { id: "1", nom: "Classe A" } as ClasseModel;

            const result = simulationAffectationCLEservice.checkPlacesRestantesCentre(
                resultats,
                jeunesList,
                classe,
                sejour,
            );

            expect(result).toBe(true);
            expect(resultats.sejourList).toHaveLength(1);
            expect(resultats.sejourList[0]).toEqual({
                sejour,
                placeOccupees: 4,
                placeRestantes: 3,
            });
        });
    });
});
