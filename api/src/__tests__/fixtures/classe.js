const { faker } = require("@faker-js/faker");

faker.locale = "fr";

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getNewClassFixture(fields = {}) {
  return {
    referentClasseIds: String(faker.datatype.number()),
    seatsTaken: faker.datatype.number({ min: 0, max: 30 }),
    cohort: `CLE ${faker.date.future().getFullYear()} ${faker.datatype.number({ min: 1, max: 3 })}`,
    uniqueId: faker.random.alphaNumeric(6),
    uniqueKey: faker.random.alphaNumeric(7),
    etablissementId: faker.datatype.uuid(),
    status: "INSCRIPTION_IN_PROGRESS",
    statusPhase1: "WAITING_AFFECTATION",
    uniqueKeyAndId: faker.random.alphaNumeric(15),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    coloration: randomElement(["ENVIRONMENT", "SPORT", "CULTURE"]),
    filiere: randomElement(["Professionnelle", "Générale et technologique"]),
    grade: randomElement(["CAP", "2ndeGT"]),
    name: faker.company.companyName(),
    totalSeats: faker.datatype.number({ min: 10, max: 30 }),
    pointDeRassemblementId: faker.datatype.uuid(),
    cohesionCenterId: faker.datatype.uuid(),
    sessionId: faker.datatype.uuid(),
    ligneId: faker.datatype.uuid(),
    ...fields,
  };
}

module.exports = getNewClassFixture;
