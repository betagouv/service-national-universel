import { fakerFR as faker } from "@faker-js/faker";
import { ROLES_LIST } from "snu-lib";
import { AlerteMessageType } from "../../models";

function getNewAlerteMessageFixture(object: Partial<AlerteMessageType> = {}): Partial<AlerteMessageType> {
  return {
    title: "Message d'alerte",
    content: "Message d'importance normale à caractère informatif (annonces sans besoin d'action de votre part) https://www.snu.gouv.fr/",
    priority: faker.helpers.arrayElement(["normal", "important", "urgent"]),
    to_role: faker.helpers.arrayElements(ROLES_LIST),
    ...object,
  };
}

export default getNewAlerteMessageFixture;
