import { YoungType } from "src";
import { getDepartmentForEligibility, getRegionForEligibility, getDepartmentForInscriptionGoal } from "./region-and-departments";

describe("getDepartmentForEligibility", () => {
  it("when young is schooled should return the school department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "true", schoolDepartment: "TestDepartment" };
    expect(getDepartmentForEligibility(young)).toBe("TestDepartment");
  });

  it("when young is not schooled and doesn't have school department should returns the department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "false", department: "TestDepartment" };
    expect(getDepartmentForEligibility(young)).toBe("TestDepartment");
  });

  it("when the both are available and the young is schooled should returns the school department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "true", schoolDepartment: "SchoolDepartment", department: "Department" };
    expect(getDepartmentForEligibility(young)).toBe("SchoolDepartment");
  });

  it("when the both are available should return the school department", () => {
    const young: Partial<YoungType> = { _id: "123", schoolDepartment: "SchoolDepartment", department: "Department" };
    expect(getDepartmentForEligibility(young)).toBe("SchoolDepartment");
  });

  it("when school country is not FRANCE should department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "youngDepartment", schoolCountry: "ESPAGNE", schoolDepartment: "134" };
    expect(getDepartmentForEligibility(young)).toBe("youngDepartment");
  });

  it("when school country is not FRANCE and schooled should department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "youngDepartment", schooled: "true", schoolCountry: "ESPAGNE", schoolDepartment: "134" };
    expect(getDepartmentForEligibility(young)).toBe("youngDepartment");
  });

  it('when department not found should returns "Etranger"', () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "false" };
    expect(getDepartmentForEligibility(young)).toBe("Etranger");
  });

  it("when department prepended with 0 should return good department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "044" };
    expect(getDepartmentForEligibility(young)).toBe("Loire-Atlantique");
  });

  it("when department corse with return good department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "2A" };
    expect(getDepartmentForEligibility(young)).toBe("Corse-du-Sud");
  });
});

describe("getDepartmentForInscriptionGoal", () => {
  it("when young is schooled should return the department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "true", department: "department", schoolDepartment: "schoolDepartment" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("department");
  });

  it("when young is not schooled and doesn't have school department should returns the department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "false", department: "department" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("department");
  });

  it("when the both are available and the young is schooled should returns the department", () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "true", schoolDepartment: "schoolDepartment", department: "department" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("department");
  });

  it("when the both are available should return the school department", () => {
    const young: Partial<YoungType> = { _id: "123", schoolDepartment: "SchoolDepartment", department: "Department" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("Department");
  });

  it("when school country is not FRANCE should department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "youngDepartment", schoolCountry: "ESPAGNE", schoolDepartment: "134" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("youngDepartment");
  });

  it("when school country is not FRANCE and schooled should department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "youngDepartment", schooled: "true", schoolCountry: "ESPAGNE", schoolDepartment: "134" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("youngDepartment");
  });

  it('when department not found should returns "Etranger"', () => {
    const young: Partial<YoungType> = { _id: "123", schooled: "false" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("Etranger");
  });

  it("when department prepended with 0 should return good department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "044" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("Loire-Atlantique");
  });

  it("when department corse with return good department", () => {
    const young: Partial<YoungType> = { _id: "123", department: "2A" };
    expect(getDepartmentForInscriptionGoal(young)).toBe("Corse-du-Sud");
  });
});

describe("getRegionForEligibility", () => {
  it("should return schoolRegion if young is schooled", () => {
    const young: Partial<YoungType> = {
      schooled: "true",
      schoolRegion: "TestRegion",
      region: "AnotherRegion",
      department: "TestDepartment",
      schoolDepartment: "AnotherDepartment",
      schoolCountry: "TestCountry",
      zip: "12345",
    };

    expect(getRegionForEligibility(young)).toBe("TestRegion");
  });

  it("should return region if young is not schooled", () => {
    const young: Partial<YoungType> = {
      schooled: "false",
      schoolRegion: "TestRegion",
      region: "AnotherRegion",
      department: "TestDepartment",
      schoolDepartment: "AnotherDepartment",
      schoolCountry: "TestCountry",
      zip: "12345",
    };

    expect(getRegionForEligibility(young)).toBe("AnotherRegion");
  });

  it('should return "Etranger" if no region is available', () => {
    const young: Partial<YoungType> = {
      schooled: "false",
    };

    expect(getRegionForEligibility(young)).toBe("Etranger");
  });
});
