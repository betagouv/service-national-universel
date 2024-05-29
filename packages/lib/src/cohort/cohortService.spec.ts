import { canUpdateCenter, canUpdateCohort } from "./cohortService";
import { CohortDto, ReferentRoleDto } from "../dto";
import { ROLES } from "../roles";

let from;
let to;
beforeEach(() => {
  from = new Date();
  to = new Date();
});
describe("cohortService", () => {
  it("should return true when calling canUpdateCohort with cohort undefined", () => {
    // Arrange
    const user = {
      role: ROLES.ADMIN,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCohort(undefined, user);

    // Assert
    expect(result).toBeTruthy();
  });

  it("should return false when calling canUpdateCohort with user undefined", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCohortForReferentRegion: true,
      cleUpdateCohortForReferentRegionDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;

    // Act
    const result = canUpdateCohort(cohort, undefined);

    // Assert
    expect(result).toBeFalsy();
  });

  it("should return true when calling canUpdateCohort for region", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCohortForReferentRegion: true,
      cleUpdateCohortForReferentRegionDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.ADMIN,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCohort(cohort, user);

    // Assert
    expect(result).toBeTruthy();
  });

  it("should return false when calling canUpdateCohort for region", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() - 1);
    const cohort = {
      cleUpdateCohortForReferentRegion: true,
      cleUpdateCohortForReferentRegionDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_REGION,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCohort(cohort, user);

    // Assert
    expect(result).toBeFalsy();
  });

  it("should return true when calling canUpdateCohort for department", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCohortForReferentDepartment: true,
      cleUpdateCohortForReferentDepartmentDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_DEPARTMENT,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCohort(cohort, user);

    // Assert
    expect(result).toBeTruthy();
  });

  it("should return false when calling canUpdateCohort for department", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCohortForReferentDepartment: false,
      cleUpdateCohortForReferentDepartmentDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_DEPARTMENT,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCohort(cohort, user);

    // Assert
    expect(result).toBeFalsy();
  });

  it("should return true when calling canUpdateCenter for region", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCentersForReferentRegion: true,
      cleUpdateCentersForReferentRegionDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_REGION,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCenter(cohort, user);

    // Assert
    expect(result).toBeTruthy();
  });

  it("should return false when calling canUpdateCenter for region", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() - 1);
    const cohort = {
      cleUpdateCentersForReferentRegion: true,
      cleUpdateCentersForReferentRegionDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_REGION,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCenter(cohort, user);

    // Assert
    expect(result).toBeFalsy();
  });

  it("should return true when calling canUpdateCenter for department", () => {
    // Arrange
    from.setDate(from.getDate() - 2);
    to.setDate(to.getDate() + 1);
    const cohort = {
      cleUpdateCentersForReferentDepartment: true,
      cleUpdateCentersForReferentDepartmentDate: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    } as CohortDto;
    const user = {
      role: ROLES.REFERENT_DEPARTMENT,
    } as ReferentRoleDto;

    // Act
    const result = canUpdateCenter(cohort, user);

    // Assert
    expect(result).toBeTruthy();
  });
});
