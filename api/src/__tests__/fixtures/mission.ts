import { fakerFR as faker } from "@faker-js/faker";
import { departmentList, MissionType, regionList } from "snu-lib";

function getNewMissionFixture(): Partial<MissionType> {
  return {
    name: faker.company.name(),
    domains: [],
    startAt: faker.date.past(),
    endAt: faker.date.past(),
    format: "CONTINUOUS",
    frequence: "",
    period: [],
    subPeriod: [],
    placesTotal: faker.number.int(),
    placesLeft: faker.number.int(),
    actions: faker.lorem.sentences(),
    description: faker.lorem.sentences(),
    justifications: faker.lorem.sentences(),
    contraintes: faker.lorem.sentences(),
    structureId: "",
    structureName: faker.company.name(),
    status: "DRAFT",
    tutorId: "",
    tutorName: "",
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
    country: faker.location.country(),
    location: {
      lat: Number(faker.location.latitude()),
      lon: Number(faker.location.longitude()),
    },
    remote: faker.lorem.sentences(),
  };
}

export default getNewMissionFixture;
