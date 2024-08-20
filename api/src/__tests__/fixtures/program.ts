import { fakerFR as faker } from "@faker-js/faker";
import { ProgramType } from "../../models";

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
    department: faker.location.state(),
    region: faker.location.state(),
    visibility: "",
  };
}

export default getNewProgramFixture;
