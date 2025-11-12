// @ts-ignore - Jest mocks
import { deleteContact } from "../../brevo";
// @ts-ignore - Jest mocks
import { YoungModel } from "../../models";
// @ts-ignore - Jest mocks
import { handler } from "../../crons/deleteLegalRepresentatives";
// @ts-ignore - Jest mocks
import * as mongo from "../../mongo";

jest.mock("../../brevo", () => ({
  deleteContact: jest.fn(),
}));

jest.mock("../../models", () => ({
  YoungModel: {
    find: jest.fn(),
  },
}));

jest.mock("../../mongo", () => ({
  startSession: jest.fn(),
  withTransaction: jest.fn(),
  endSession: jest.fn(),
}));

describe("deleteLegalRepresentatives cron", () => {
  const mockSession = { id: "session123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (mongo.startSession as jest.Mock).mockResolvedValue(mockSession);
    (mongo.withTransaction as jest.Mock).mockImplementation(async (session, callback) => {
      return await callback();
    });
    (mongo.endSession as jest.Mock).mockResolvedValue(undefined);
  });

  describe("Query MongoDB", () => {
    it("should query only cohorts containing years 2020-2023", async () => {
      (YoungModel.find as jest.Mock).mockResolvedValue([]);

      await handler();

      expect(YoungModel.find).toHaveBeenCalled();
      const query = (YoungModel.find as jest.Mock).mock.calls[0][0];
      expect(query.cohort.$regex).toBeInstanceOf(RegExp);
      expect(query.cohort.$regex.source).toBe("(2020|2021|2022|2023)");
      expect(query.cohort.$regex.test("2022")).toBe(true);
      expect(query.cohort.$regex.test("Juillet 2022")).toBe(true);
      expect(query.cohort.$regex.test("Juin 2021")).toBe(true);
      expect(query.cohort.$regex.test("2024")).toBe(false);
    });

    it("should query only youngs with RL_deleted != true", async () => {
      (YoungModel.find as jest.Mock).mockResolvedValue([]);

      await handler();

      const query = (YoungModel.find as jest.Mock).mock.calls[0][0];
      expect(query.RL_deleted.$ne).toBe(true);
    });

    it("should query only youngs with birthdateAt = yesterday", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      (YoungModel.find as jest.Mock).mockResolvedValue([]);

      await handler();

      const query = (YoungModel.find as jest.Mock).mock.calls[0][0];
      expect(query.birthdateAt.$gte.getTime()).toBe(yesterday.getTime());
      expect(query.birthdateAt.$lt.getTime()).toBe(yesterdayEnd.getTime());
    });

    it("should not process youngs already with RL_deleted = true", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        RL_deleted: true,
        set: jest.fn(),
        save: jest.fn(),
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([]);

      await handler();

      expect(young.set).not.toHaveBeenCalled();
      expect(young.save).not.toHaveBeenCalled();
    });
  });

  describe("Idempotence", () => {
    it("should skip processing if RL_deleted is already true", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        RL_deleted: true,
        parent1Email: "parent1@test.com",
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(young.set).not.toHaveBeenCalled();
      expect(young.save).not.toHaveBeenCalled();
      expect(deleteContact).not.toHaveBeenCalled();
      expect(mongo.startSession).not.toHaveBeenCalled();
    });

    it("should process if RL_deleted is false or null", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young: any = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        RL_deleted: false,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };
      young.save.mockResolvedValue(young);

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(young.set).toHaveBeenCalled();
      expect(young.save).toHaveBeenCalled();
      expect(deleteContact).toHaveBeenCalled();
    });
  });

  describe("J+1 birthday calculation", () => {
    it("should process youngs at J+1 of their birthday (birthdate = yesterday)", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        parent2Email: "parent2@test.com",
        parent1FirstName: "Parent1",
        parent2FirstName: "Parent2",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(young.set).toHaveBeenCalled();
      expect(young.save).toHaveBeenCalled();
      const setCalls = (young.set as jest.Mock).mock.calls;
      const lastSetCall = setCalls[setCalls.length - 1];
      expect(lastSetCall[0].RL_deleted).toBe(true);
    });

    it("should not process youngs not at J+1 of their birthday (birthdate = 2 days ago)", async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      twoDaysAgo.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: twoDaysAgo,
        parent1Email: "parent1@test.com",
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);

      await handler();

      expect(young.set).not.toHaveBeenCalled();
      expect(young.save).not.toHaveBeenCalled();
    });

    it("should not process youngs with birthdate = today", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: today,
        parent1Email: "parent1@test.com",
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);

      await handler();

      expect(young.set).not.toHaveBeenCalled();
      expect(young.save).not.toHaveBeenCalled();
    });
  });

  describe("RL fields deletion", () => {
    it("should delete ALL parent1 and parent2 fields", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Status: "MOTHER",
        parent1FirstName: "Parent1",
        parent1LastName: "Parent1Last",
        parent1Email: "parent1@test.com",
        parent1Phone: "0123456789",
        parent1PhoneZone: "FR",
        parent1OwnAddress: "true",
        parent1Address: "123 rue Test",
        parent1Zip: "75001",
        parent1City: "Paris",
        parent1Department: "75",
        parent1Region: "Île-de-France",
        parent1Country: "FR",
        parent2Status: "FATHER",
        parent2FirstName: "Parent2",
        parent2LastName: "Parent2Last",
        parent2Email: "parent2@test.com",
        parent2Phone: "0987654321",
        parent2PhoneZone: "FR",
        parent2Address: "456 rue Test",
        parent2Zip: "69001",
        parent2City: "Lyon",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      const setCalls = (young.set as jest.Mock).mock.calls;
      const firstSetCall = setCalls[0];
      const updateFields = firstSetCall[0];

      expect(updateFields.parent1Status).toBeUndefined();
      expect(updateFields.parent1FirstName).toBeUndefined();
      expect(updateFields.parent1LastName).toBeUndefined();
      expect(updateFields.parent1Email).toBeUndefined();
      expect(updateFields.parent1Phone).toBeUndefined();
      expect(updateFields.parent1PhoneZone).toBeUndefined();
      expect(updateFields.parent1OwnAddress).toBeUndefined();
      expect(updateFields.parent1Address).toBeUndefined();
      expect(updateFields.parent1Zip).toBeUndefined();
      expect(updateFields.parent1City).toBeUndefined();
      expect(updateFields.parent1Department).toBeUndefined();
      expect(updateFields.parent1Region).toBeUndefined();
      expect(updateFields.parent1Country).toBeUndefined();

      expect(updateFields.parent2Status).toBeUndefined();
      expect(updateFields.parent2FirstName).toBeUndefined();
      expect(updateFields.parent2LastName).toBeUndefined();
      expect(updateFields.parent2Email).toBeUndefined();
      expect(updateFields.parent2Phone).toBeUndefined();
      expect(updateFields.parent2PhoneZone).toBeUndefined();
      expect(updateFields.parent2Address).toBeUndefined();
      expect(updateFields.parent2Zip).toBeUndefined();
      expect(updateFields.parent2City).toBeUndefined();
    });
  });

  describe("Patches cleaning", () => {
    it("should clean patches containing parent fields", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const patch1 = {
        ops: [
          { path: "/parent1Email", value: "old@test.com" },
          { path: "/firstName", value: "John" },
        ],
        set: jest.fn(),
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      const patch2 = {
        ops: [{ path: "/parent2Phone", value: "123456" }],
        set: jest.fn(),
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      const patch3 = {
        ops: [{ path: "/email", value: "young@test.com" }],
        set: jest.fn(),
        save: jest.fn(),
        deleteOne: jest.fn(),
      };

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([patch1, patch2, patch3]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(young.patches.find).toHaveBeenCalledWith({ ref: young._id });
      expect(patch1.set).toHaveBeenCalledWith({ ops: [{ path: "/firstName", value: "John" }] });
      expect(patch1.save).toHaveBeenCalled();
      expect(patch2.deleteOne).toHaveBeenCalled();
      expect(patch3.set).toHaveBeenCalledWith({ ops: [{ path: "/email", value: "young@test.com" }] });
      expect(patch3.save).toHaveBeenCalled();
    });
  });

  describe("Brevo deletion", () => {
    it("should delete parent emails from Brevo", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        parent2Email: "parent2@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(deleteContact).toHaveBeenCalledWith("parent1@test.com");
      expect(deleteContact).toHaveBeenCalledWith("parent2@test.com");
    });

    it("should handle Brevo errors gracefully", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockRejectedValue(new Error("Brevo error"));

      await expect(handler()).resolves.not.toThrow();
      expect(young.save).toHaveBeenCalled();
    });
  });

  describe("Historic entry", () => {
    it("should add entry to historic with correct data", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(young.historic.length).toBe(1);
      expect((young.historic[0] as any).userName).toBe("Système");
      expect((young.historic[0] as any).userId).toBeUndefined();
      expect((young.historic[0] as any).phase).toBe("CONTINUE");
      expect((young.historic[0] as any).status).toBe("VALIDATED");
      expect((young.historic[0] as any).note).toBe("Suppression automatique des données des représentants légaux (J+1 anniversaire)");
      expect((young.historic[0] as any).createdAt).toBeInstanceOf(Date);
    });

    it("should initialize historic if it does not exist", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: undefined,
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(Array.isArray(young.historic)).toBe(true);
      expect((young.historic as any)?.length).toBe(1);
    });
  });

  describe("RL_deleted flag", () => {
    it("should set RL_deleted to true in second set call", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      const setCalls = (young.set as jest.Mock).mock.calls;
      expect(setCalls.length).toBe(2);
      expect(setCalls[0][0].RL_deleted).toBeUndefined();
      expect(setCalls[1][0].RL_deleted).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should continue processing other youngs if one fails", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young1 = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn().mockImplementation(() => {
          throw new Error("Save error");
        }),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      const young2 = {
        _id: "young2",
        cohort: "2021",
        birthdateAt: yesterday,
        parent1Email: "parent2@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young1, young2]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await expect(handler()).resolves.not.toThrow();

      expect(young2.set).toHaveBeenCalled();
      expect(young2.save).toHaveBeenCalled();
    });
  });

  describe("MongoDB transaction atomicity", () => {
    it("should use transaction for MongoDB operations", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young: any = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };
      young.save.mockResolvedValue(young);

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      await handler();

      expect(mongo.startSession).toHaveBeenCalled();
      expect(mongo.withTransaction).toHaveBeenCalledWith(mockSession, expect.any(Function));
      expect(mongo.endSession).toHaveBeenCalledWith(mockSession);
    });

    it("should not call Brevo if transaction fails", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn().mockRejectedValue(new Error("Transaction save failed")),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);
      (mongo.withTransaction as jest.Mock).mockImplementation(async (session, callback) => {
        try {
          return await callback();
        } catch (error) {
          throw error;
        }
      });

      await handler();

      expect(young.save).toHaveBeenCalled();
      expect(deleteContact).not.toHaveBeenCalled();
    });

    it("should call Brevo only after successful transaction commit", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const young: any = {
        _id: "young1",
        cohort: "2022",
        birthdateAt: yesterday,
        parent1Email: "parent1@test.com",
        parent2Email: "parent2@test.com",
        phase: "CONTINUE",
        status: "VALIDATED",
        historic: [],
        RL_deleted: null,
        set: jest.fn(),
        save: jest.fn(),
        patches: {
          find: jest.fn().mockResolvedValue([]),
        },
      };
      young.save.mockResolvedValue(young);

      (YoungModel.find as jest.Mock).mockResolvedValue([young]);
      (deleteContact as jest.Mock).mockResolvedValue(undefined);

      let transactionCommitted = false;
      (mongo.withTransaction as jest.Mock).mockImplementation(async (session, callback) => {
        await callback();
        transactionCommitted = true;
      });

      await handler();

      expect(transactionCommitted).toBe(true);
      expect(deleteContact).toHaveBeenCalledWith("parent1@test.com");
      expect(deleteContact).toHaveBeenCalledWith("parent2@test.com");
    });
  });
});

