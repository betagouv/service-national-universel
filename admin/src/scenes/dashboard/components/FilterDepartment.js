import React from "react";
import { useSelector } from "react-redux";

import { departmentList, region2department, REFERENT_ROLES, academyToDepartments } from "../../../utils";
import MultiSelect from "./MultiSelect";

export default ({ value = [], onChange, filter }) => {
  const user = useSelector((state) => state.Auth.user);
  const filteredDepartment = () => {
    if (filter.academy?.length)
      return filter.academy?.reduce((previous, current) => {
        return [...previous, ...academyToDepartments[current]?.map((d) => ({ label: d, value: d }))];
      }, []);
    if (!filter.region?.length) return departmentList?.map((d) => ({ label: d, value: d }));
    return filter.region?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ label: d, value: d }))), []);
  };

  if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) {
    return <MultiSelect disabled label="Département(s)" options={filteredDepartment()} onChange={onChange} value={value} />;
  }
  return <MultiSelect label="Département(s)" options={filteredDepartment()} onChange={onChange} value={value} />;
};
