import { YoungModel } from "../../models";
import { handler } from "../../crons/deleteLegalRepresentatives";
import { dbConnect, dbClose, mockTransaction } from "../helpers/db";
import { getYoungWithCompleteParentsFixture } from "../fixtures/young";
import { createYoungHelper } from "../helpers/young";
import YoungPatchModel from "../../../src/crons/patch/models/youngPatch";
import mongoose from "mongoose";

jest.mock("../../brevo", () => ({
  deleteContact: jest.fn().mockResolvedValue(undefined),
  // Les hooks mongoose du modèle jeune (`post("save")`, `post("findOneAndUpdate")`,
  // `post("deleteOne")`) appellent `brevo.sync` / `brevo.unsync`. Un bouchon partiel du module les
  // laissait à `undefined` : `createYoungHelper` échouait sur `brevo.sync is not a function`.
  sync: jest.fn().mockResolvedValue(undefined),
  unsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../rateLimiters", () => ({
  rateLimiterDeleteContactSIB: {
    call: jest.fn((fn) => fn()),
  },
}));

const buildBirthdateForAge = (years: number, daysOffset: number = 0): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + daysOffset);
  targetDate.setFullYear(targetDate.getFullYear() - years);
  return targetDate;
};

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  // `processYoung` écrit dans une transaction. Le MongoDB des tests est un nœud autonome, pas un
  // replica set : la transaction échoue (« Transaction numbers are only allowed on a replica set
  // member or mongos »), l'erreur est avalée par le `catch` du handler et aucun volontaire n'est
  // traité — la suite testait donc un no-op.
  mockTransaction();
});
afterAll(async () => await dbClose());

beforeEach(async () => {
  await YoungModel.deleteMany({});
  await YoungPatchModel.deleteMany({});
});

describe("deleteLegalRepresentatives E2E", () => {
  describe("Test 1: Vérification de la requête MongoDB", () => {
    it("should query exactly 4 youngs aged 18+ from cohorts 2020-2023", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);
      const birthdate17Years = buildBirthdateForAge(17, -1);

      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Juillet 2021",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Juin 2022",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Avril 2023",
        }),
      );

      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Février 2020",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Juillet 2021",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Juin 2022",
        }),
      );
      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Avril 2023",
        }),
      );

      await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2024",
        }),
      );

      await handler();
            
      const processedYoungs = await YoungModel.find({ rlDeleted: true });
      expect(processedYoungs.length).toBe(4);

      const cohorts = processedYoungs.map((y) => y.cohort).sort();
      const expectedCohorts = ["Avril 2023", "Février 2020", "Juin 2022", "Juillet 2021"].sort();
      expect(cohorts).toEqual(expectedCohorts);
    });
  });

  describe("Test 2: Suppression des champs du représentant légal", () => {
    it("should delete all parent fields and set rlDeleted to true", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
        }),
      );

      expect(young.parent1FirstName).toBeDefined();
      expect(young.parent2FirstName).toBeDefined();

      await handler();

      const updatedYoung: any = await YoungModel.findById(young._id);

      expect(updatedYoung?.rlDeleted).toBe(true);
      expect(updatedYoung?.parent1Status).toBeUndefined();
      expect(updatedYoung?.parent1FirstName).toBeUndefined();
      expect(updatedYoung?.parent1LastName).toBeUndefined();
      expect(updatedYoung?.parent1Email).toBeUndefined();
      expect(updatedYoung?.parent1Phone).toBeUndefined();
      expect(updatedYoung?.parent1PhoneZone).toBeUndefined();
      expect(updatedYoung?.parent1OwnAddress).toBeUndefined();
      expect(updatedYoung?.parent1Address).toBeUndefined();
      expect(updatedYoung?.parent1coordinatesAccuracyLevel).toBeUndefined();
      expect(updatedYoung?.parent1ComplementAddress).toBeUndefined();
      expect(updatedYoung?.parent1Zip).toBeUndefined();
      expect(updatedYoung?.parent1City).toBeUndefined();
      expect(updatedYoung?.parent1CityCode).toBeUndefined();
      expect(updatedYoung?.parent1Department).toBeUndefined();
      expect(updatedYoung?.parent1Region).toBeUndefined();
      expect(updatedYoung?.parent1Country).toBeUndefined();
      expect(updatedYoung?.parent1Location).toMatchObject({lat: 0, lon: 0});
      expect(updatedYoung?.parent1FromFranceConnect).toBeUndefined();
      expect(updatedYoung?.parent1Inscription2023Token).toBeUndefined();
      expect(updatedYoung?.parent1DataVerified).toBeUndefined();
      expect(updatedYoung?.parent1AddressVerified).toBeUndefined();
      expect(updatedYoung?.parent1AllowCovidAutotest).toBeUndefined();
      expect(updatedYoung?.parent1AllowImageRights).toBeUndefined();
      expect(updatedYoung?.parent1ContactPreference).toBeUndefined();
      expect(updatedYoung?.parent1AllowSNU).toBeUndefined();

      expect(updatedYoung?.parent2Status).toBeUndefined();
      expect(updatedYoung?.parent2FirstName).toBeUndefined();
      expect(updatedYoung?.parent2LastName).toBeUndefined();
      expect(updatedYoung?.parent2Email).toBeUndefined();
      expect(updatedYoung?.parent2Phone).toBeUndefined();
      expect(updatedYoung?.parent2PhoneZone).toBeUndefined();
      expect(updatedYoung?.parent2OwnAddress).toBeUndefined();
      expect(updatedYoung?.parent2Address).toBeUndefined();
      expect(updatedYoung?.parent2coordinatesAccuracyLevel).toBeUndefined();
      expect(updatedYoung?.parent2ComplementAddress).toBeUndefined();
      expect(updatedYoung?.parent2Zip).toBeUndefined();
      expect(updatedYoung?.parent2City).toBeUndefined();
      expect(updatedYoung?.parent2CityCode).toBeUndefined();
      expect(updatedYoung?.parent2Department).toBeUndefined();
      expect(updatedYoung?.parent2Region).toBeUndefined();
      expect(updatedYoung?.parent2Country).toBeUndefined();
      expect(updatedYoung?.parent2Location).toMatchObject({lat: 0, lon: 0});
      expect(updatedYoung?.parent2FromFranceConnect).toBeUndefined();
      expect(updatedYoung?.parent2Inscription2023Token).toBeUndefined();
      expect(updatedYoung?.parent2DataVerified).toBeUndefined();
      expect(updatedYoung?.parent2AddressVerified).toBeUndefined();
      expect(updatedYoung?.parent2AllowCovidAutotest).toBeUndefined();
      expect(updatedYoung?.parent2AllowImageRights).toBeUndefined();
      expect(updatedYoung?.parent2ContactPreference).toBeUndefined();
      expect(updatedYoung?.parent2AllowSNU).toBeUndefined();
    });

  });

  describe("Test 4: Nettoyage des patches", () => {
    it("should delete patches containing ONLY parent fields", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
        }),
      );

      young.parent1FirstName = "UpdatedName1";
      await young.save();

      young.parent2FirstName = "UpdatedName2";
      await young.save();

      const db = mongoose.connection;
      const patchesCollection = db.collection("young_patches");
      const patchesBeforeCount = await patchesCollection.countDocuments({ ref: young._id });
      expect(patchesBeforeCount).toBeGreaterThan(0);

      await handler();

      const patchesAfter = await patchesCollection.find({ ref: young._id }).toArray();
      const parentOnlyPatches = patchesAfter.filter((patch: any) => {
        return patch.ops.every((op: any) => {
          const field = op.path.split("/")[1];
          return field && (field.startsWith("parent1") || field.startsWith("parent2"));
        });
      });

      expect(parentOnlyPatches.length).toBe(0);
    });

    it("should modify patches containing mixed fields (parent + non-parent)", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
          firstName: "InitialFirstName",
        }),
      );

      young.parent1FirstName = "UpdatedParent1Name";
      young.firstName = "UpdatedFirstName";
      await young.save();

      await handler();

      const db = mongoose.connection;
      const patchesCollection = db.collection("young_patches");
      const patchesAfter = await patchesCollection.find({ ref: young._id }).toArray();

      const mixedPatch = patchesAfter.find((patch: any) => {
        return patch.ops.some((op: any) => op.path === "/firstName");
      });

      if (mixedPatch) {
        const hasParentOps = (mixedPatch as any).ops.some((op: any) => {
          const field = op.path.split("/")[1];
          return field && (field.startsWith("parent1") || field.startsWith("parent2"));
        });
        expect(hasParentOps).toBe(false);

        const hasFirstNameOp = (mixedPatch as any).ops.some((op: any) => op.path === "/firstName");
        expect(hasFirstNameOp).toBe(true);
      }
    });
  });

  describe("Test 5: Vérification du patch rlDeleted", () => {
    it("should create a patch for rlDeleted field change", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
        }),
      );

      await handler();

      const db = mongoose.connection;
      const patchesCollection = db.collection("young_patches");
      const patches = await patchesCollection.find({ ref: young._id }).toArray();

      const rlDeletedPatch = patches.find((patch: any) => {
        return patch.ops.some((op: any) => op.path === "/rlDeleted");
      });

      console.log("rlDeletedPatch", rlDeletedPatch);

      expect(rlDeletedPatch).toBeDefined();
      expect(rlDeletedPatch?.user?.firstName).toBe("Cron deleteLegalRepresentatives");

      const rlDeletedOp = (rlDeletedPatch as any).ops.find((op: any) => op.path === "/rlDeleted");
      expect(rlDeletedOp).toBeDefined();
      expect(rlDeletedOp?.op).toMatch(/replace|add/);
      expect(rlDeletedOp?.value).toBe(true);
    });
  });

  describe("Test 6: Cas exclus non traités", () => {
    it("should not process youngs under 18 years old", async () => {
      const birthdate17Years = buildBirthdateForAge(17, -1);

      const young1 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Février 2020",
        }),
      );
      const young2 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Juillet 2021",
        }),
      );
      const young3 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Juin 2022",
        }),
      );
      const young4 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Avril 2023",
        }),
      );

      await handler();

      const updatedYoung1: any = await YoungModel.findById(young1._id);
      const updatedYoung2: any = await YoungModel.findById(young2._id);
      const updatedYoung3: any = await YoungModel.findById(young3._id);
      const updatedYoung4: any = await YoungModel.findById(young4._id);

      expect(updatedYoung1?.parent1FirstName).toBeDefined();
      expect(updatedYoung1?.parent2FirstName).toBeDefined();
      expect(updatedYoung1?.rlDeleted).not.toBe(true);

      expect(updatedYoung2?.parent1FirstName).toBeDefined();
      expect(updatedYoung2?.parent2FirstName).toBeDefined();
      expect(updatedYoung2?.rlDeleted).not.toBe(true);

      expect(updatedYoung3?.parent1FirstName).toBeDefined();
      expect(updatedYoung3?.parent2FirstName).toBeDefined();
      expect(updatedYoung3?.rlDeleted).not.toBe(true);

      expect(updatedYoung4?.parent1FirstName).toBeDefined();
      expect(updatedYoung4?.parent2FirstName).toBeDefined();
      expect(updatedYoung4?.rlDeleted).not.toBe(true);
    });

    it("should not process youngs from cohort 2024", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2024",
        }),
      );

      await handler();

      const updatedYoung: any = await YoungModel.findById(young._id);

      expect(updatedYoung?.parent1FirstName).toBeDefined();
      expect(updatedYoung?.parent2FirstName).toBeDefined();
      expect(updatedYoung?.rlDeleted).not.toBe(true);
    });

  });
});
