import React from "react";
import { useSelector } from "react-redux";

import { regionList, REFERENT_ROLES } from "../../../utils";
import MultiSelect from "./MultiSelect";

export default ({ value = [], onChange }) => {
  const user = useSelector((state) => state.Auth.user);
  const options = regionList.map((region) => ({ label: region, value: region }));

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return <div />;

  if (user.role === REFERENT_ROLES.REFERENT_REGION) {
    return <MultiSelect disabled label="Région(s)" options={options} onChange={onChange} value={value} />;
  }
  return <MultiSelect label="Région(s)" options={options} onChange={onChange} value={value} />;
};
