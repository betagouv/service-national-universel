import { fakerFR as faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { ContractType } from "../../models";
const { ObjectId } = Types;

function getNewContractFixture(): Partial<ContractType> {
  return {
    youngId: new ObjectId().toString(),
    structureId: new ObjectId().toString(),
    applicationId: new ObjectId().toString(),
    missionId: new ObjectId().toString(),
    isYoungAdult: "false",
    youngFirstName: faker.person.firstName(),
    youngLastName: faker.person.lastName(),
    youngBirthdate: faker.date.past().toISOString(),
    youngAddress: faker.location.streetAddress(),
    youngCity: faker.location.city(),
    youngDepartment: faker.location.city(),
    youngEmail: faker.internet.email(),
    youngPhone: faker.phone.number(),
    parent1FirstName: faker.person.firstName(),
    parent1LastName: faker.person.lastName(),
    parent1Address: faker.location.streetAddress(),
    parent1City: faker.location.city(),
    parent1Department: faker.location.city(),
    parent1Phone: faker.phone.number(),
    parent1Email: faker.internet.email(),
    parent2FirstName: faker.person.firstName(),
    parent2LastName: faker.person.lastName(),
    parent2Address: faker.location.streetAddress(),
    parent2City: faker.location.city(),
    parent2Department: faker.location.city(),
    parent2Phone: faker.phone.number(),
    parent2Email: faker.internet.email(),
    missionName: faker.company.name(),
    missionObjective: faker.lorem.sentence(),
    missionAction: faker.lorem.sentence(),
    missionStartAt: faker.date.past().toISOString(),
    missionEndAt: faker.date.future().toISOString(),
    missionAddress: faker.location.streetAddress(),
    missionCity: faker.location.city(),
    missionZip: faker.location.zipCode(),
    missionDuration: faker.number.int().toString(),
    missionFrequence: faker.helpers.arrayElement(["une fois par semaine", "deux fois par semaine"]),
    date: faker.date.past().toISOString(),
    projectManagerFirstName: faker.person.firstName(),
    projectManagerLastName: faker.person.lastName(),
    projectManagerRole: faker.helpers.arrayElement(["Chef de projet départemental"]),
    projectManagerEmail: faker.internet.email(),
    structureManagerFirstName: faker.person.firstName(),
    structureManagerLastName: faker.person.lastName(),
    structureManagerRole: faker.helpers.arrayElement(["Tuteur de mission", "chef de centre"]),
    structureManagerEmail: faker.internet.email(),
    structureSiret: faker.company.name(),
    structureName: faker.company.name(),
    tutorFirstName: faker.person.firstName(),
    tutorLastName: faker.person.lastName(),
  };
}

export default getNewContractFixture;