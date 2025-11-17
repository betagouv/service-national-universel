import { COHORT_PRESETS } from "../presets";
import getNewCohortFixture from "../cohort";
import { createCohortHelper } from "../../helpers/cohort";
import { CohortType } from "snu-lib";

export class CohortBuilder {
  private data: Partial<CohortType> = {};

  published() {
    this.data = { ...this.data, ...COHORT_PRESETS.published };
    return this;
  }

  partiallyArchived() {
    this.data = { ...this.data, ...COHORT_PRESETS.partiallyArchived };
    return this;
  }

  fullyArchived() {
    this.data = { ...this.data, ...COHORT_PRESETS.fullyArchived };
    return this;
  }

  withName(name: string) {
    this.data.name = name;
    return this;
  }

  withStatus(status: "PUBLISHED" | "ARCHIVED" | "FULLY_ARCHIVED") {
    this.data.status = status;
    return this;
  }

  withDates(dateStart: Date, dateEnd: Date) {
    this.data.dateStart = dateStart;
    this.data.dateEnd = dateEnd;
    return this;
  }

  with(fields: Partial<CohortType>) {
    this.data = { ...this.data, ...fields };
    return this;
  }

  async build() {
    const fixture = getNewCohortFixture(this.data);
    return await createCohortHelper(fixture);
  }

  buildFixture() {
    return getNewCohortFixture(this.data);
  }
}

