import { fakerFR as faker } from "@faker-js/faker";
import { PointDeRassemblementType } from "snu-lib";

function getNewPointDeRassemblementFixture(object: Partial<PointDeRassemblementType> = {}): Partial<PointDeRassemblementType> {
  return {
    code: faker.lorem.words(),
    cohorts: ["Février 2023 - C"],
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.location.state(),
    region: faker.location.state(),
    // country: faker.location.country(),
    location: {
      lat: Number(faker.location.latitude()),
      lon: Number(faker.location.longitude()),
    },
    matricule: faker.lorem.words(),
    particularitesAcces: faker.lorem.words(),
    ...object,
  };
}

export default getNewPointDeRassemblementFixture;
