import { fakerFR as faker } from "@faker-js/faker";
import { departmentList, DepartmentServiceType, regionList } from "snu-lib";

function getNewDepartmentServiceFixture(): Partial<DepartmentServiceType> {
  return {
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
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
