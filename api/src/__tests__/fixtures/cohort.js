const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function getNewCohortFixture(object = {}) {
  return {
    snuId: faker.lorem.words(),
    name: faker.lorem.words(),
    dsnjExportDates: {
      firstExportDate: faker.date.past(),
      secondExportDate: faker.date.past(),
    },
    isAssignmentAnnouncementsOpenForYoung: faker.random.boolean(),
    manualAffectionOpenForAdmin: faker.random.boolean(),
    manualAffectionOpenForReferentRegion: faker.random.boolean(),
    manualAffectionOpenForReferentDepartment: faker.random.boolean(),
    dateStart: faker.date.past(),
    dateEnd: faker.date.past(),
    pdrChoiceLimitDate: faker.date.past(),
    validationDate: faker.date.past(),
    validationDateForTerminaleGrade: faker.date.past(),
    youngCheckinForAdmin: faker.random.boolean(),
    youngCheckinForHeadOfCenter: faker.random.boolean(),
    youngCheckinForRegionReferent: faker.random.boolean(),
    youngCheckinForDepartmentReferent: faker.random.boolean(),
    busListAvailability: faker.random.boolean(),
    sessionEditionOpenForReferentRegion: faker.random.boolean(),
    sessionEditionOpenForReferentDepartment: faker.random.boolean(),
    repartitionSchemaCreateAndEditGroupAvailability: faker.random.boolean(),
    repartitionSchemaDownloadAvailability: faker.random.boolean(),
    ...object,
  };
}

module.exports = getNewCohortFixture;
