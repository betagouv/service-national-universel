import { fakerFR as faker } from "@faker-js/faker";
import { DepartmentServiceType } from "../../models";

function getNewDepartmentServiceFixture(): Partial<DepartmentServiceType> {
  return {
    department: faker.location.state(),
    region: faker.location.state(),
    directionName: faker.company.name(),
    serviceName: faker.company.name(),
    serviceNumber: faker.number.int().toString(),
    address: faker.location.streetAddress(),
    complementAddress: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    description: faker.lorem.sentences(),
  };
}

export default getNewDepartmentServiceFixture;
