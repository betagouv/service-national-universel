import mongoose, { Connection, Model, Schema } from "mongoose";

import { APPLICATION_STATUS, ApplicationSchema } from "snu-lib";

import { CandidatureDocument } from "@admin/infra/engagement/candidature/provider/CandidatureMongo.provider";
import { CandidatureRepository } from "@admin/infra/engagement/candidature/repository/mongo/CandidatureMongo.repository";

import { getSharedConnectionString } from "../../initMongoContainer";

/**
 * Les candidatures d'une structure servent de périmètre aux exports de volontaires d'un responsable
 * et d'un superviseur. Une proposition de mission en attente d'acceptation n'en fait pas partie.
 */
describe("CandidatureRepository - périmètre d'une structure", () => {
    let connection: Connection;
    let model: Model<CandidatureDocument>;
    let repository: CandidatureRepository;

    beforeAll(async () => {
        connection = await mongoose
            .createConnection(getSharedConnectionString(), { directConnection: true })
            .asPromise();
        model = connection.model<CandidatureDocument>("candidature_perimetre", new Schema(ApplicationSchema));
        repository = new CandidatureRepository(model);
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await model.deleteMany({});
    });

    const creer = (structureId: string, status: string) =>
        model.create({ structureId, status, youngId: `young-${status}` });

    it("findByStructureId ne renvoie pas les propositions en attente d'acceptation", async () => {
        const candidature = await creer("structure-1", APPLICATION_STATUS.WAITING_VALIDATION);
        const refusee = await creer("structure-1", APPLICATION_STATUS.REFUSED);
        await creer("structure-1", APPLICATION_STATUS.WAITING_ACCEPTATION);
        await creer("structure-2", APPLICATION_STATUS.WAITING_VALIDATION);

        const resultat = await repository.findByStructureId("structure-1");

        expect(resultat.map((c) => c.id).sort()).toEqual([candidature._id.toString(), refusee._id.toString()].sort());
    });

    it("findByStructureIds ne renvoie pas les propositions en attente d'acceptation", async () => {
        const chezUne = await creer("structure-1", APPLICATION_STATUS.VALIDATED);
        const chezAutre = await creer("structure-2", APPLICATION_STATUS.DONE);
        await creer("structure-1", APPLICATION_STATUS.WAITING_ACCEPTATION);
        await creer("structure-3", APPLICATION_STATUS.VALIDATED);

        const resultat = await repository.findByStructureIds(["structure-1", "structure-2"]);

        expect(resultat.map((c) => c.id).sort()).toEqual([chezUne._id.toString(), chezAutre._id.toString()].sort());
    });
});
