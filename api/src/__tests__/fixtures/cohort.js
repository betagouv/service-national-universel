const { fakerFR: faker } = require("@faker-js/faker");

function getNewCohortFixture(object = {}) {
  return {
    snuId: faker.lorem.words(),
    name: faker.lorem.words(),
    dsnjExportDates: {
      firstExportDate: faker.date.past(),
      secondExportDate: faker.date.past(),
    },
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
    buffer: faker.datatype.number(),
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
    ...object,
  };
}

module.exports = getNewCohortFixture;
