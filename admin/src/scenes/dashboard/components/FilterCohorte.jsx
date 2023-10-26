import React from "react";

import { getCohortNames } from "../../../utils";
import MultiSelect from "./MultiSelect";

export default function FilterCohorte({ value = [], onChange }) {
  const options = getCohortNames().map((e) => ({ label: e, value: e }));

  return <MultiSelect label="Cohorte(s)" options={options} onChange={onChange} value={value} />;
}
