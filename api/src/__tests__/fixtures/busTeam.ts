import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { LigneBusType } from "../../models";
const { ObjectId } = Types;

const getBusTeamFixture = (object): Partial<LigneBusType["team"]> => ({
  role: faker.person.jobTitle(),
  idTeam: new ObjectId().toHexString(),
  lastName: faker.person.lastName(),
  firstName: faker.person.firstName(),
  birthdate: faker.date.past({ years: 20 }).toISOString(), // Ensure a reasonable age
  phone: faker.phone.number(),
  mail: faker.internet.email(),
  forth: faker.datatype.boolean(),
  back: faker.datatype.boolean(),
  ...object,
});

export default getBusTeamFixture;
