const { faker } = require("@faker-js/faker");
const { CLE_TYPE_LIST, CLE_SECTOR_LIST } = require("snu-lib");

faker.locale = "fr";

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getNewEtablissementFixture(fields = {}) {
  return {
    schoolId: faker.datatype.uuid(),
    uai: faker.helpers.replaceSymbolWithNumber("######"),
    name: faker.company.companyName(),
    referentEtablissementIds: Array.from({ length: 3 }, () => faker.datatype.uuid()),
    coordinateurIds: Array.from({ length: 2 }, () => faker.datatype.uuid()),
    department: faker.address.state(),
    region: faker.address.state(),
    zip: faker.address.zipCode(),
    city: faker.address.city(),
    address: faker.address.streetAddress(),
    country: faker.address.country(),
    type: [randomElement(CLE_TYPE_LIST)],
    sector: [randomElement(CLE_SECTOR_LIST)],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.date.future(),
    ...fields,
  };
}

module.exports = getNewEtablissementFixture;
