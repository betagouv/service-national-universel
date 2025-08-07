import { getMinistres } from "../templates/certificate/utils";

describe("Certificate Phase 2 Template Tests", () => {
  describe("getMinistres function", () => {
    it("should return Corinne Orzechowski for dates before August 22, 2025", () => {
      const dateBefore = new Date("2025-08-21"); // Avant le 22 août 2025
      const result = getMinistres(dateBefore);
      
      expect(result).toBeDefined();
      expect(result.ministres).toContain("Corinne Orzechowski");
      expect(result.template).toBe("certificates/certificateTemplate2024_3.png");
    });

    it("should return Franck Thénard-Duvivier for dates from August 22, 2025", () => {
      const dateAfter = new Date("2025-08-22"); // À partir du 22 août 2025
      const result = getMinistres(dateAfter);
      
      expect(result).toBeDefined();
      expect(result.ministres).toContain("Franck Thénard-Duvivier");
      expect(result.template).toBe("certificates/attestationPhase2Template_FTD.png");
    });

    it("should return Franck Thénard-Duvivier for future dates", () => {
      const futureDate = new Date("2026-01-01");
      const result = getMinistres(futureDate);
      
      expect(result).toBeDefined();
      expect(result.ministres).toContain("Franck Thénard-Duvivier");
      expect(result.template).toBe("certificates/attestationPhase2Template_FTD.png");
    });

    it("should return Nicole Belloubet and Sebastien Lecornu for dates in 2024", () => {
      const date2024 = new Date("2024-10-15");
      const result = getMinistres(date2024);
      
      expect(result).toBeDefined();
      expect(result.ministres).toContain("Nicole Belloubet, Ministre de l'Education Nationale et de la Jeunesse");
      expect(result.ministres).toContain("Sebastien Lecornu, Ministre des Armées");
      expect(result.template).toBe("certificates/certificateTemplate2024_2.png");
    });
  });
});
