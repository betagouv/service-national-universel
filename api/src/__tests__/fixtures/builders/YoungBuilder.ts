import { YOUNG_PRESETS } from "../presets";
import getNewYoungFixture from "../young";
import { createYoungHelper } from "../../helpers/young";
import { YoungType } from "snu-lib";

export class YoungBuilder {
  private data: Partial<YoungType> = {};

  eligible() {
    this.data = { ...this.data, ...YOUNG_PRESETS.eligible };
    return this;
  }

  notEligible() {
    this.data = { ...this.data, ...YOUNG_PRESETS.notEligible };
    return this;
  }

  phase2Validated() {
    this.data = { ...this.data, ...YOUNG_PRESETS.phase2Validated };
    return this;
  }

  phase1Exempted() {
    this.data = { ...this.data, ...YOUNG_PRESETS.phase1Exempted };
    return this;
  }

  inCohort(cohortId: string, cohortName: string) {
    this.data.cohortId = cohortId;
    this.data.cohort = cohortName;
    return this;
  }

  withDepartment(department: string) {
    this.data.department = department;
    return this;
  }

  withRegion(region: string) {
    this.data.region = region;
    return this;
  }

  withEmail(email: string) {
    this.data.email = email;
    return this;
  }

  withStatus(status: string) {
    this.data.status = status;
    return this;
  }

  withStatusPhase1(statusPhase1: string) {
    this.data.statusPhase1 = statusPhase1;
    return this;
  }

  withStatusPhase2(statusPhase2: string) {
    this.data.statusPhase2 = statusPhase2;
    return this;
  }

  with(fields: Partial<YoungType>) {
    this.data = { ...this.data, ...fields };
    return this;
  }

  async build() {
    const fixture = getNewYoungFixture(this.data);
    return await createYoungHelper(fixture);
  }

  buildFixture() {
    return getNewYoungFixture(this.data);
  }
}

