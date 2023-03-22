/* eslint-disable import/no-unused-modules */
import { departmentList, department2region, REFERENT_ROLES } from "snu-lib";
import { useSelector } from "react-redux";
import api from "../../services/api";

export const getInscriptionGoals = async (regions, departements, academy) => {
  const user = useSelector((state) => state.Auth.user);

  function filterByRegionAndDepartement(e) {
    if (departements.length) return departements.includes(e.department);
    else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
    if (regions.length) return regions.includes(e.region);
    if (academy.length) return academy.includes(e.academy);
    return true;
  }

  let dataMerged = [];
  for (const cohort of filter.cohort) {
    const { data, ok } = await api.get("/inscription-goal/" + cohort);
    if (!ok) return toastr.error("Une erreur s'est produite.");

    data.forEach(
      ({ department, region, academy, max }) =>
        (dataMerged[department] = { department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max }),
    );
  }

  return departmentList.map(
    (d) =>
      Object.values(dataMerged)
        .filter(filterByRegionAndDepartement)
        .find((e) => e.department === d) || { department: d, region: department2region[d], max: null },
  );
};
