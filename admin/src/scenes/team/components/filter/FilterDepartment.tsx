import React from "react";
import { useSelector } from "react-redux";
import { departmentList, region2department, REFERENT_ROLES, getDepartmentNumber } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";

export default function FilterDepartment({ value = [], onChange, filter }) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const filteredDepartment = (): { label: string; value: string }[] => {
    if (!filter.region?.length) return departmentList?.map((d) => ({ label: `${d} (${getDepartmentNumber(d)})`, value: d }));
    return filter.region?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ label: `${d} (${getDepartmentNumber(d)})`, value: d }))), []);
  };

  return (
    <select className="border-0 bg-inherit text-center" disabled={user.role === REFERENT_ROLES.REFERENT_DEPARTMENT} onChange={onChange} value={value.length ? value[0] : ""}>
      <option value="" disabled>
        Département
      </option>
      {filteredDepartment()?.map((d) => (
        <option key={d.value} value={d.value}>
          {d.label}
        </option>
      ))}
    </select>
  );
}
