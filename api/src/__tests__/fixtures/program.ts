import { fakerFR as faker } from "@faker-js/faker";
import { departmentList, ProgramType, regionList } from "snu-lib";

function getNewProgramFixture(): Partial<ProgramType> {
  return {
    name: faker.company.name(),
    description: faker.lorem.sentences(),
    descriptionFor: faker.lorem.sentences(),
    descriptionMoney: faker.lorem.sentences(),
    descriptionDuration: faker.lorem.sentences(),
    url: faker.internet.url(),
    imageFile: "",
    imageString: "",
    type: faker.lorem.sentences(),
    department: faker.helpers.arrayElement(departmentList),
    region: faker.helpers.arrayElement(regionList),
    visibility: "",
  };
}

export default getNewProgramFixture;
