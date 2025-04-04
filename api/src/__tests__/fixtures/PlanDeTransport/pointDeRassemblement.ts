import { fakerFR as faker } from "@faker-js/faker";
import { departmentList, PointDeRassemblementType, regionList } from "snu-lib";

function getNewPointDeRassemblementFixture(object: Partial<PointDeRassemblementType> = {}): Partial<PointDeRassemblementType> {
  return {
    code: faker.lorem.words(),
    cohorts: ["Février 2023 - C"],
    name: faker.company.name(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
    academie: faker.location.state(),
    // country: faker.location.country(),
    location: {
      lat: Number(faker.location.latitude()),
      lon: Number(faker.location.longitude()),
    },
    matricule: faker.lorem.words(),
    particularitesAcces: faker.lorem.words(),
    uai: faker.string.alpha(8).toUpperCase(),
    numeroOrdre: faker.number.int({ min: 4, max: 16 }).toString().padStart(3, "0"),
    dateCreation: faker.date.past(),
    dateDebutValidite: faker.date.past(),
    dateDerniereModification: faker.date.past(),
    ...object,
  };
}

export default getNewPointDeRassemblementFixture;
