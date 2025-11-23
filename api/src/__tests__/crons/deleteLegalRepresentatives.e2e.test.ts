import { YoungModel, LegalRepresentativeArchiveModel } from "../../models";
import { handler } from "../../crons/deleteLegalRepresentatives";
import { dbConnect, dbClose } from "../helpers/db";
import { getYoungWithCompleteParentsFixture } from "../fixtures/young";
import { createYoungHelper } from "../helpers/young";
import YoungPatchModel from "../../../src/crons/patch/models/youngPatch";
import mongoose from "mongoose";

jest.mock("../../brevo", () => ({
  deleteContact: jest.fn().mockResolvedValue(undefined),
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

beforeAll(async () => await dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(async () => await dbClose());

beforeEach(async () => {
  await YoungModel.deleteMany({});
  await YoungPatchModel.deleteMany({});
  await LegalRepresentativeArchiveModel.deleteMany({});
});

describe("deleteLegalRepresentatives E2E", () => {
  describe("Test 1: Vérification de la requête MongoDB et archivage", () => {
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

    it("should archive legal representatives data for one young", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);
      const parent1ValidationDate = new Date("2023-01-15");
      const parent2ValidationDate = new Date("2023-01-16");

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
          parent1FirstName: "Marie",
          parent1LastName: "Dupont",
          parent1AllowImageRights: "true",
          parent1AllowSNU: "true",
          parent1ValidationDate,
          rulesParent1: "true",
          parent2FirstName: "Jean",
          parent2LastName: "Dupont",
          parent2AllowImageRights: "false",
          parent2AllowSNU: "true",
          parent2ValidationDate,
          rulesParent2: "true",
        }),
      );

      await handler();

      const archives = await LegalRepresentativeArchiveModel.find({ youngId: young._id });

      expect(archives.length).toBe(2);

      const parent1Archive = archives.find((a) => a.parentIndex === 1);
      const parent2Archive = archives.find((a) => a.parentIndex === 2);

      expect(parent1Archive).toBeDefined();
      expect(parent1Archive?.firstName).toBe("Marie");
      expect(parent1Archive?.lastName).toBe("Dupont");
      expect(parent1Archive?.allowImageRights).toBe("true");
      expect(parent1Archive?.allowSNU).toBe("true");
      expect(parent1Archive?.validationDate).toEqual(parent1ValidationDate);
      expect(parent1Archive?.rulesParent).toBe("true");
      expect(parent1Archive?.archivedAt).toBeInstanceOf(Date);

      expect(parent2Archive).toBeDefined();
      expect(parent2Archive?.firstName).toBe("Jean");
      expect(parent2Archive?.lastName).toBe("Dupont");
      expect(parent2Archive?.allowImageRights).toBe("false");
      expect(parent2Archive?.allowSNU).toBe("true");
      expect(parent2Archive?.validationDate).toEqual(parent2ValidationDate);
      expect(parent2Archive?.rulesParent).toBe("true");
      expect(parent2Archive?.archivedAt).toBeInstanceOf(Date);
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
      expect(updatedYoung?.parent1Location).toMatchObject({});
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
      expect(updatedYoung?.parent2Location).toMatchObject({});
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

  describe("Test 3: Vérification complète des archives", () => {
    it("should create 8 archive entries for 4 youngs with 2 parents each", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young1 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
        }),
      );
      const young2 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Juillet 2021",
        }),
      );
      const young3 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Juin 2022",
        }),
      );
      const young4 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Avril 2023",
        }),
      );

      await handler();

      const totalArchives = await LegalRepresentativeArchiveModel.countDocuments({});

      expect(totalArchives).toBe(8);

      const young1Archives = await LegalRepresentativeArchiveModel.find({ youngId: young1._id });
      const young2Archives = await LegalRepresentativeArchiveModel.find({ youngId: young2._id });
      const young3Archives = await LegalRepresentativeArchiveModel.find({ youngId: young3._id });
      const young4Archives = await LegalRepresentativeArchiveModel.find({ youngId: young4._id });

      expect(young1Archives.length).toBe(2);
      expect(young2Archives.length).toBe(2);
      expect(young3Archives.length).toBe(2);
      expect(young4Archives.length).toBe(2);

      const youngs = [young1, young2, young3, young4];

      const allArchives = await LegalRepresentativeArchiveModel.find({ youngId: { $in: youngs.map((y) => y._id) } });

      for (const young of youngs) {
        const archives = allArchives.filter((a) => String(a.youngId) === String(young._id));
        expect(archives.length).toBe(2);

        for (const archive of archives) {
          expect([1, 2]).toContain(archive.parentIndex);

          const parentIndex = archive.parentIndex;
          const parentPrefix = `parent${parentIndex}`;
          expect(archive.firstName).toBe(young[`${parentPrefix}FirstName`]);
          expect(archive.lastName).toBe(young[`${parentPrefix}LastName`]);
          expect(archive.allowImageRights).toBe(young[`${parentPrefix}AllowImageRights`]);
          expect(archive.allowSNU).toBe(young[`${parentPrefix}AllowSNU`]);
          expect(archive.validationDate?.toISOString()).toBe(young[`${parentPrefix}ValidationDate`]?.toISOString?.());
          expect(archive.rulesParent).toEqual(young[`rulesParent${parentIndex}`]);
          expect(archive.youngId.toString()).toBe(young._id.toString());
          expect(archive.archivedAt).not.toBeUndefined();
        }
      }
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

    it("should keep patches containing NO parent fields unchanged", async () => {
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2020",
          firstName: "InitialFirstName",
        }),
      );

      young.firstName = "UpdatedFirstName";
      await young.save();

      const db = mongoose.connection;
      const patchesCollection = db.collection("young_patches");
      const patchesBeforeHandler = await patchesCollection.find({ ref: young._id }).toArray();
      const nonParentPatchesBefore = patchesBeforeHandler.filter((patch: any) => {
        return patch.ops.every((op: any) => {
          const field = op.path.split("/")[1];
          return !field || (!field.startsWith("parent1") && !field.startsWith("parent2"));
        });
      });

      await handler();

      const patchesAfter = await patchesCollection.find({ ref: young._id }).toArray();
      const nonParentPatchesAfter = patchesAfter.filter((patch: any) => {
        return patch.ops.every((op: any) => {
          const field = op.path.split("/")[1];
          return !field || (!field.startsWith("parent1") && !field.startsWith("parent2"));
        });
      });

      expect(nonParentPatchesAfter.length).toBe(nonParentPatchesBefore.length + 1);
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

      expect(rlDeletedPatch).toBeDefined();
      expect(rlDeletedPatch?.user?.firstName).toBe("Cron deleteLegalRepresentatives");

      const rlDeletedOp = (rlDeletedPatch as any).ops.find((op: any) => op.path === "/rlDeleted");
      expect(rlDeletedOp).toBeDefined();
      expect(rlDeletedOp?.op).toBe("add");
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

    it("should not create archive entries for excluded youngs", async () => {
      const birthdate17Years = buildBirthdateForAge(17, -1);
      const birthdate18Plus1Day = buildBirthdateForAge(18, -1);

      const young1 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate17Years,
          cohort: "Février 2020",
        }),
      );

      const young2 = await createYoungHelper(
        getYoungWithCompleteParentsFixture({
          birthdateAt: birthdate18Plus1Day,
          cohort: "Février 2024",
        }),
      );

      await handler();

      const archives1 = await LegalRepresentativeArchiveModel.find({ youngId: young1._id });
      const archives2 = await LegalRepresentativeArchiveModel.find({ youngId: young2._id });

      expect(archives1.length).toBe(0);
      expect(archives2.length).toBe(0);
    });
  });
});
