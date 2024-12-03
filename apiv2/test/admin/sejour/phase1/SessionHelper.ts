import mongoose from "mongoose";
import { fakerFR as faker } from "@faker-js/faker";

import { COHORT_STATUS, COHORT_TYPE } from "snu-lib";

import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { SessionModel } from "@admin/core/sejours/phase1/session/Session.model";

import { getAdminTestModuleRef } from "../../setUpAdminTest";

export const createSession = async (session?: Partial<SessionModel>) => {
    const adminTestModule = getAdminTestModuleRef();
    const sessionGateway = adminTestModule.get<SessionGateway>(SessionGateway);

    return await sessionGateway.create({
        id: new mongoose.Types.ObjectId().toString(),
        snuId: faker.lorem.words(),
        nom: faker.lorem.words(),
        dsnjExportDates: {},
        statut: COHORT_STATUS.PUBLISHED,
        type: COHORT_TYPE.VOLONTAIRE,
        isAssignmentAnnouncementsOpenForYoung: faker.datatype.boolean(),
        manualAffectionOpenForAdmin: faker.datatype.boolean(),
        manualAffectionOpenForReferentRegion: faker.datatype.boolean(),
        manualAffectionOpenForReferentDepartment: faker.datatype.boolean(),
        dateStart: faker.date.past(),
        dateEnd: faker.date.past(),
        inscriptionStartDate: faker.date.past(),
        inscriptionEndDate: faker.date.past(),
        instructionEndDate: faker.date.past(),
        pdrChoiceLimitDate: faker.date.past(),
        eligibility: {
            zones: ["A", "B", "C"],
            schoolLevels: ["3eme", "4eme"],
            bornAfter: faker.date.past(),
            bornBefore: faker.date.past(),
        },
        buffer: faker.number.int(),
        event: faker.lorem.words(),
        validationDate: faker.date.past(),
        validationDateForTerminaleGrade: faker.date.past(),
        youngCheckinForAdmin: faker.datatype.boolean(),
        youngCheckinForHeadOfCenter: faker.datatype.boolean(),
        youngCheckinForRegionReferent: faker.datatype.boolean(),
        youngCheckinForDepartmentReferent: faker.datatype.boolean(),
        busListAvailability: faker.datatype.boolean(),
        sessionEditionOpenForReferentRegion: faker.datatype.boolean(),
        sessionEditionOpenForReferentDepartment: faker.datatype.boolean(),
        sessionEditionOpenForTransporter: faker.datatype.boolean(),
        repartitionSchemaCreateAndEditGroupAvailability: faker.datatype.boolean(),
        repartitionSchemaDownloadAvailability: faker.datatype.boolean(),
        ...session,
    });
};
