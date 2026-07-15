import { CohortModel, CohortGroupModel } from "../../models";
import { COHORT_STATUS, COHORT_TYPE } from "snu-lib";
import { dbConnect, dbClose } from "../helpers/db";
import getNewCohortFixture from "../fixtures/cohort";

// La migration est un module CommonJS { up, down }.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const migration = require("../../../migrations/20260713144238-archivage-cohortes-2024-2025");

beforeAll(async () => await dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(async () => await dbClose());

beforeEach(async () => {
  await CohortModel.deleteMany({});
  await CohortGroupModel.deleteMany({});
});

async function createGroup(name: string, year?: number) {
  return CohortGroupModel.create({ name, ...(year ? { year } : {}), type: COHORT_TYPE.VOLONTAIRE });
}

async function createCohort(name: string, groupId?: any) {
  return CohortModel.create({
    ...getNewCohortFixture(),
    snuId: name,
    name,
    status: COHORT_STATUS.PUBLISHED,
    cohortGroupId: groupId ? groupId.toString() : undefined,
  });
}

const statusOf = async (id: any) => (await CohortModel.findById(id))?.status;

describe("Migration archivage cohortes 2024/2025", () => {
  it("up() : total pour 2024, partiel pour 2025, exceptions 2024 en partiel, hors-périmètre inchangé", async () => {
    const cle2024 = await createGroup("CLE 2024", 2024);
    const hts2024 = await createGroup("HTS 2024", 2024);
    const cle2025 = await createGroup("CLE 2025", 2025);
    const hts2025 = await createGroup("HTS 2025", 2025);
    const reserve = await createGroup("Réserve"); // sans year -> hors périmètre

    // 2024 -> FULLY_ARCHIVED (dont CLE 23-24 dont le nom ne contient pas "2024")
    const fev2024 = await createCohort("Février 2024 - A", hts2024._id);
    const cle2324 = await createCohort("CLE 23-24", cle2024._id);
    // Exceptions (groupe 2024) -> ARCHIVED
    const toussaint = await createCohort("Toussaint 2024", hts2024._id);
    const toussaintReunion = await createCohort("Toussaint 2024 - La Réunion", hts2024._id);
    const cle05 = await createCohort("2024 CLE 05", cle2024._id);
    const cle06 = await createCohort("2024 CLE 06 - Novembre", cle2024._id);
    // 2025 -> ARCHIVED
    const juin2025 = await createCohort("2025 HTS 03 - Juin", hts2025._id);
    const cleJanv2025 = await createCohort("2025 CLE 01 - Janvier", cle2025._id);
    // Hors périmètre -> inchangé
    const aVenir = await createCohort("à venir", reserve._id);

    await migration.up();

    expect(await statusOf(fev2024._id)).toBe(COHORT_STATUS.FULLY_ARCHIVED);
    expect(await statusOf(cle2324._id)).toBe(COHORT_STATUS.FULLY_ARCHIVED);
    expect(await statusOf(toussaint._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(toussaintReunion._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(cle05._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(cle06._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(juin2025._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(cleJanv2025._id)).toBe(COHORT_STATUS.ARCHIVED);
    expect(await statusOf(aVenir._id)).toBe(COHORT_STATUS.PUBLISHED);
  });

  it("down() : repose les cohortes 2024/2025 concernées à PUBLISHED", async () => {
    const hts2024 = await createGroup("HTS 2024", 2024);
    const hts2025 = await createGroup("HTS 2025", 2025);
    const c2024 = await createCohort("Février 2024 - A", hts2024._id);
    const toussaint = await createCohort("Toussaint 2024", hts2024._id);
    const c2025 = await createCohort("2025 HTS 03 - Juin", hts2025._id);

    await migration.up();
    await migration.down();

    expect(await statusOf(c2024._id)).toBe(COHORT_STATUS.PUBLISHED);
    expect(await statusOf(toussaint._id)).toBe(COHORT_STATUS.PUBLISHED);
    expect(await statusOf(c2025._id)).toBe(COHORT_STATUS.PUBLISHED);
  });

  it("up() : lève une erreur et n'écrit rien si les groupes 2024/2025 sont absents", async () => {
    const orphan = await createCohort("Février 2024 - A"); // aucune groupe créé

    await expect(migration.up()).rejects.toThrow();
    expect(await statusOf(orphan._id)).toBe(COHORT_STATUS.PUBLISHED);
  });
});
