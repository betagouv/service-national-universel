import PDFDocument from "pdfkit";
import { PHASE2_EXCEPTIONAL_VALIDATION, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YoungType } from "snu-lib";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import getNewYoungFixture from "./fixtures/young";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));

afterEach(() => jest.restoreAllMocks());

function youngFixture(exceptional: boolean, hours: string): YoungType {
  return getNewYoungFixture({
    firstName: "Camille",
    lastName: "Test",
    cohort: "Session 2025",
    statusPhase1: YOUNG_STATUS_PHASE1.DONE,
    statusPhase2: YOUNG_STATUS_PHASE2.VALIDATED,
    statusPhase2ValidatedAt: new Date("2026-11-09T08:00:00+01:00"),
    phase2NumberHoursDone: hours,
    phase2ExceptionalValidation: exceptional
      ? {
          reason: PHASE2_EXCEPTIONAL_VALIDATION.REASON,
          validatedAt: new Date("2026-11-09T08:00:00+01:00"),
          hoursDone: Number(hours),
        }
      : undefined,
  }) as YoungType;
}

describe("attestation de validation exceptionnelle", () => {
  it.each(["42", "50", "83"])("génère un vrai PDF pour %s h sans certifier 84 heures", async (hours) => {
    const textSpy = jest.spyOn(PDFDocument.prototype, "text");
    const pdf = await generatePdfIntoBuffer({ type: "certificate", template: "2", young: youngFixture(true, hours) });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
    expect(textSpy).toHaveBeenCalledWith(expect.stringContaining("félicite"), 150, 280, { continued: true, width: expect.any(Number) });
    expect(textSpy).toHaveBeenCalledWith("pour la réalisation de sa ", { continued: true, width: expect.any(Number) });
    const text = textSpy.mock.calls.map((call) => call[0]).join("");
    expect(text).toContain("Camille Test");
    expect(text).toContain("pour la réalisation de sa mission d'intérêt général");
    expect(text).toContain("validation exceptionnelle des cohortes 2025");
    expect(text).not.toContain("84 heures");
  });

  it("conserve le libellé historique pour une validation ordinaire", async () => {
    const textSpy = jest.spyOn(PDFDocument.prototype, "text");
    await generatePdfIntoBuffer({ type: "certificate", template: "2", young: youngFixture(false, "84") });
    const text = textSpy.mock.calls.map((call) => call[0]).join("");
    expect(text).toContain("84 heures de mission d'intérêt général");
    expect(text).not.toContain("validation exceptionnelle");
  });

  it("permet aussi de générer l'attestation SNU après validation exceptionnelle", async () => {
    const pdf = await generatePdfIntoBuffer({ type: "certificate", template: "snu", young: youngFixture(true, "42") });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("refuse toujours l'attestation avant validation de la phase 2", async () => {
    const young = youngFixture(false, "42");
    young.statusPhase2 = YOUNG_STATUS_PHASE2.IN_PROGRESS;
    await expect(generatePdfIntoBuffer({ type: "certificate", template: "2", young })).rejects.toThrow("OPERATION_UNAUTHORIZED");
  });
});
