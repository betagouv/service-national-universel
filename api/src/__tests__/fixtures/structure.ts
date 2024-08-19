import { fakerFR as faker } from "@faker-js/faker";
import { StructureType } from "../../models";

function getNewStructureFixture(): Partial<StructureType> {
  return {
    name: faker.company.name(),
    siret: faker.number.int().toString(),
    description: faker.lorem.sentences(),
    website: faker.internet.url(),
    facebook: faker.internet.url(),
    twitter: faker.internet.url(),
    instagram: faker.internet.url(),
    status: "WAITING_VALIDATION",
    isNetwork: "true",
    networkId: "",
    networkName: faker.company.name(),
    legalStatus: "ASSOCIATION",
    associationTypes: [],
    structurePubliqueType: faker.lorem.sentences(),
    structurePubliqueEtatType: faker.lorem.sentences(),
    structurePriveeType: faker.lorem.sentences(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.location.state(),
    region: faker.location.state(),
    country: faker.location.country(),
    location: {
      lat: Number(faker.location.latitude()),
      lon: Number(faker.location.longitude()),
    },
    state: faker.location.state(),
    isMilitaryPreparation: "false",
  };
}

export default getNewStructureFixture;
