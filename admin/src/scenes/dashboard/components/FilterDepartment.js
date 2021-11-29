import React from "react";
import { useSelector } from "react-redux";

import { departmentList, region2department, REFERENT_ROLES } from "../../../utils";
import MultiSelect from "./MultiSelect";

export default ({ value = [], onChange, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const filteredDepartment = () => {
    if (!filter.region?.length) return departmentList?.map((d) => ({ label: d, value: d }));
    return filter.region?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ label: d, value: d }))), []);
  };

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    return <MultiSelect disabled label="Département(s)" options={[]} onChange={onChange} value={value} />;
  }
  return <MultiSelect disabled label="Département(s)" options={filteredDepartment()} onChange={onChange} value={value} />;
};
