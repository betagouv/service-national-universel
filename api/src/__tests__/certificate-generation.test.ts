import { getMinistres } from "../templates/certificate/utils";

describe("Certificate Generation Integration", () => {
  describe("Phase 2 Certificate Generation", () => {
    it("should use Franck Thénard-Duvivier for dates after August 22, 2025", async () => {
      const mockYoung = {
        firstName: "Jean",
        lastName: "Dupont",
        cohort: "2025",
        statusPhase2ValidatedAt: new Date("2025-08-25"),
      };

      const ministresData = getMinistres(mockYoung.statusPhase2ValidatedAt);
      
      expect(ministresData).toBeDefined();
      expect(ministresData?.ministres).toContain("Franck Thénard-Duvivier");
      expect(ministresData?.template).toBe("certificates/attestationPhase2Template_FTD.png");
    });

    it("should use Corinne Orzechowski for dates before August 22, 2025", async () => {
      const mockYoung = {
        firstName: "Marie",
        lastName: "Martin",
        cohort: "2025",
        statusPhase2ValidatedAt: new Date("2025-08-15"),
      };

      const ministresData = getMinistres(mockYoung.statusPhase2ValidatedAt);
      
      expect(ministresData).toBeDefined();
      expect(ministresData?.ministres).toContain("Corinne Orzechowski");
      expect(ministresData?.template).toBe("certificates/certificateTemplate2024_3.png");
    });
  });
});
