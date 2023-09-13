import { academyToDepartments, department2region, departmentList, departmentToAcademy, region2department, ROLES } from "snu-lib";
import dayjs from "@/utils/dayjs.utils";

export const getFilteredDepartment = (setSelectedFilters, selectedFilters, setDepartmentOptions, user) => {
  const departmentOptions = user.role === ROLES.REFERENT_REGION ? region2department[user.region] : departmentList;
  if (selectedFilters.academy?.length) {
    setSelectedFilters({ ...selectedFilters, department: selectedFilters?.department?.filter((d) => selectedFilters.academy?.includes(departmentToAcademy[d])) });
    return setDepartmentOptions(
      selectedFilters.academy?.reduce((previous, current) => {
        return [...previous, ...(academyToDepartments[current] || []).map((d) => ({ key: d, label: d }))];
      }, []) || [],
    );
  }
  if (!selectedFilters.region?.length) return setDepartmentOptions(departmentOptions?.map((d) => ({ key: d, label: d })));
  setSelectedFilters({ ...selectedFilters, department: selectedFilters?.department?.filter((d) => selectedFilters.region?.includes(department2region[d])) });
  setDepartmentOptions(selectedFilters.region?.reduce((previous, current) => previous?.concat(region2department[current]?.map((d) => ({ key: d, label: d }))), []));
};

export const getDepartmentOptions = (user, setDepartmentOptions) => {
  return setDepartmentOptions(user?.department?.map((d) => ({ key: d, label: d })));
};

export function computeMissionUrl(filters, missionFilters, other) {
  let query = [];
  if (filters.region && filters.region.length > 0) {
    query.push(`REGION=%5B"${filters.region.join('"%2C"')}"%5D`);
  }
  if (filters.department && filters.department.length > 0) {
    query.push(`DEPARTMENT=%5B"${filters.department.join('"%2C"')}"%5D`);
  }
  if (missionFilters.sources && missionFilters.sources.length === 1) {
    query.push(`SOURCE=%5B"${missionFilters.sources[0] === "JVA" ? "true" : "false"}"%5D`);
  }
  if (missionFilters.start || missionFilters.end) {
    let dates = [];
    if (missionFilters.start) {
      dates.push("FROMDATE", dayjs(missionFilters.start).format("YYYY-MM-DD"));
    }
    if (missionFilters.end) {
      dates.push("TODATE", dayjs(missionFilters.end).format("YYYY-MM-DD"));
    }
    query.push(`DATE=%5B"${dates.join('"%2C"')}"%5D`);
  }

  if (other) {
    for (const key of Object.keys(other)) {
      query.push(`${key}=%5B"${other[key]}"%5D`);
    }
  }

  if (query.length > 0) {
    return "/mission?" + query.join("&");
  } else {
    return "/mission";
  }
}
