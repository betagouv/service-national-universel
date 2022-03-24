import React from "react";
import { useSelector } from "react-redux";

import { regionList, REFERENT_ROLES } from "../../../utils";
import MultiSelect from "./MultiSelect";

export default function FilterSource({ value = [], onChange }) {
  const options = [
    { label: "JVA", value: "true" },
    { label: "SNU", value: "false" },
  ];

  return <MultiSelect label="Source" options={options} onChange={onChange} value={value} />;
}
