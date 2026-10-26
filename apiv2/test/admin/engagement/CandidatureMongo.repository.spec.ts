import mongoose, { Connection, Model, Schema } from "mongoose";

import { APPLICATION_STATUS, ApplicationSchema } from "snu-lib";

import { CandidatureDocument } from "@admin/infra/engagement/candidature/provider/CandidatureMongo.provider";
import { CandidatureRepository } from "@admin/infra/engagement/candidature/repository/mongo/CandidatureMongo.repository";

import { getSharedConnectionString } from "../../initMongoContainer";

/**
 * Les candidatures d'une structure servent de périmètre aux exports de volontaires d'un responsable
 * et d'un superviseur. Une proposition de mission que le volontaire n'a pas acceptée n'en fait pas
 * partie, qu'elle soit en attente, refusée ou annulée.
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

    const creer = (structureId: string, status: string, proposalNotAccepted?: boolean) =>
        model.create({
            structureId,
            status,
            youngId: `young-${status}`,
            ...(proposalNotAccepted ? { proposalNotAccepted } : {}),
        });

    it("findByStructureId ne renvoie pas les propositions non acceptées, quel que soit leur statut", async () => {
        const candidature = await creer("structure-1", APPLICATION_STATUS.WAITING_VALIDATION);
        const refusee = await creer("structure-1", APPLICATION_STATUS.REFUSED);
        await creer("structure-1", APPLICATION_STATUS.WAITING_ACCEPTATION, true);
        await creer("structure-1", APPLICATION_STATUS.REFUSED, true);
        await creer("structure-1", APPLICATION_STATUS.CANCEL, true);
        await creer("structure-2", APPLICATION_STATUS.WAITING_VALIDATION);

        const resultat = await repository.findByStructureId("structure-1");

        expect(resultat.map((c) => c.id).sort()).toEqual([candidature._id.toString(), refusee._id.toString()].sort());
    });

    it("findByStructureIds ne renvoie pas les propositions non acceptées, quel que soit leur statut", async () => {
        const chezUne = await creer("structure-1", APPLICATION_STATUS.VALIDATED);
        const chezAutre = await creer("structure-2", APPLICATION_STATUS.DONE);
        await creer("structure-1", APPLICATION_STATUS.WAITING_ACCEPTATION);
        await creer("structure-2", APPLICATION_STATUS.CANCEL, true);
        await creer("structure-3", APPLICATION_STATUS.VALIDATED);

        const resultat = await repository.findByStructureIds(["structure-1", "structure-2"]);

        expect(resultat.map((c) => c.id).sort()).toEqual([chezUne._id.toString(), chezAutre._id.toString()].sort());
    });
});
