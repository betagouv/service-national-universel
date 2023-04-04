import { academyToDepartments, department2region, departmentList, departmentToAcademy, region2department, ROLES } from "snu-lib";

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
