import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
const { ObjectId } = Types;

const getBusTeamFixture = (object) => ({
  role: faker.person.jobTitle(),
  idTeam: ObjectId(),
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
