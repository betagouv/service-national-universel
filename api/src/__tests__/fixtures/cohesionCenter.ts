import { fakerFR as faker } from "@faker-js/faker";
import { CohesionCenterDomainEnum, CohesionCenterType, CohesionCenterTypologyEnum, departmentList, regionList } from "snu-lib";

function getNewCohesionCenterFixture(object: Partial<CohesionCenterType> = {}): Partial<CohesionCenterType> {
  const placesLeft = 15;
  return {
    name: faker.lorem.word(),
    code: faker.lorem.word(),
    departmentCode: "55",
    address: faker.lorem.word(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
    country: faker.location.country(),
    placesTotal: placesLeft,
    placesLeft: placesLeft,
    outfitDelivered: faker.lorem.word(),
    observations: faker.lorem.word(),
    waitingList: [faker.lorem.word(), faker.lorem.word()],
    COR: faker.lorem.word(),
    cohorts: ["2020"],
    ...object,
  };
}

function getNewCohesionCenterFixtureV2(object = {}): Partial<CohesionCenterType> {
  return {
    name: faker.lorem.word(),
    code2022: faker.string.uuid(),
    address: faker.lorem.word(),
    city: faker.location.city(),
    zip: faker.location.zipCode(),
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
    addressVerified: "true",
    placesTotal: 20,
    pmr: "false",
    academy: faker.location.city(),
    typology: CohesionCenterTypologyEnum.PUBLIC_ETAT,
    domain: CohesionCenterDomainEnum.ETABLISSEMENT,
    complement: faker.lorem.word(),
    centerDesignation: faker.lorem.word(),
    cohorts: ["Février 2023 - C"],
    ...object,
  };
}

export { getNewCohesionCenterFixture, getNewCohesionCenterFixtureV2 };
