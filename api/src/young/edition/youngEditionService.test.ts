import { generateConsentChanges } from "./youngEditionService";
import { YOUNG_STATUS } from "snu-lib";

describe("generateConsentChanges", () => {
  it("should return correct changes when consent is true", () => {
    const value = {
      consent: true,
      imageRights: true,
    };
    const young = {
      inscriptionStep2023: "WAITING_CONSENT",
      reinscriptionStep2023: "WAITING_CONSENT",
      parent2Status: true,
    };

    const changes = generateConsentChanges(value, young);

    expect(changes).toEqual({
      status: YOUNG_STATUS.WAITING_VALIDATION,
      inscriptionStep2023: "DONE",
      reinscriptionStep2023: "DONE",
      parentAllowSNU: "true",
      imageRight: "true",
      parent1AllowSNU: "true",
      parent1ValidationDate: expect.any(Date),
      parent1AllowImageRights: "true",
      parent2AllowSNU: "true",
      parent2ValidationDate: expect.any(Date),
      parent2AllowImageRights: "true",
    });
  });

  it("should return correct changes when consent is false", () => {
    const value = {
      consent: false,
      imageRights: false,
    };
    const young = {
      inscriptionStep2023: "WAITING_CONSENT",
      reinscriptionStep2023: "DONE",
      parent2Status: true,
    };

    const changes = generateConsentChanges(value, young);

    expect(changes).toEqual({
      status: YOUNG_STATUS.NOT_AUTORISED,
      parentAllowSNU: "false",
      imageRight: "false",
      parent1AllowSNU: false,
      parent1ValidationDate: expect.any(Date),
      parent1AllowImageRights: "false",
      parent2AllowSNU: "false",
      parent2ValidationDate: expect.any(Date),
      parent2AllowImageRights: "false",
    });
  });

  it("should not update certain fields if conditions are not met", () => {
    const value = {
      consent: true,
      imageRights: false,
    };
    const young = {
      inscriptionStep2023: "DONE",
      reinscriptionStep2023: "DONE",
      parent2Status: false,
    };

    const changes = generateConsentChanges(value, young);

    expect(changes).toEqual({
      status: YOUNG_STATUS.WAITING_VALIDATION,
      parentAllowSNU: "true",
      imageRight: "false",
      parent1AllowSNU: "true",
      parent1ValidationDate: expect.any(Date),
      parent1AllowImageRights: "false",
    });
  });

  it("should handle case where consent is undefined or false", () => {
    const value = {
      consent: undefined,
      imageRights: undefined,
    };
    const young = {
      parent2Status: true,
    };

    const changes = generateConsentChanges(value, young);

    expect(changes).toEqual({});
  });
});
