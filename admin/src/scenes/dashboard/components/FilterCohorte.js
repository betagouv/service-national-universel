import React from "react";

//import { COHORTS } from "../../../utils";
import MultiSelect from "./MultiSelect";

const COHORTS = ["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"];

export default function FilterCohorte({ value = [], onChange }) {
  const options = COHORTS.map((e) => ({ label: e, value: e }));

  return <MultiSelect label="Cohorte(s)" options={options} onChange={onChange} value={value} />;
}
