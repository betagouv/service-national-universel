import React, { useEffect, useState } from "react";
import InfoDepartement from "./InfoDepartment";
import FilterDepartment from "./filter/FilterDepartment";
import { useSelector } from "react-redux";
import { ROLES, getDepartmentNumber, department2region } from "../../../utils";

export default function Nav({ filter, updateFilter }) {
  const user = useSelector((state) => state.Auth.user);
  const [currentTab, setCurrentTab] = useState();
  const [userInTheSameRegion, setUserInTheSameRegion] = useState();

  useEffect(() => {
    if (currentTab === "region") {
      updateFilter({ department: [], role: [ROLES.REFERENT_REGION, ROLES.VISITOR] });
    } else if (user.department.map((department) => department2region[department]).includes(currentTab)) {
      updateFilter({ department: [], role: [ROLES.REFERENT_REGION, ROLES.VISITOR], region: [currentTab] });
    } else if (user.department.includes(currentTab) || currentTab === "department") {
      if (user.role === ROLES.REFERENT_DEPARTMENT) {
        updateFilter({ department: [currentTab], role: [ROLES.REFERENT_DEPARTMENT], region: [] });
      } else {
        updateFilter({ role: [ROLES.REFERENT_DEPARTMENT] });
      }
    }
  }, [currentTab]);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      setCurrentTab(user.department[0]);
      const region = department2region[user.department[0]];
      if (user.department.every((depart) => department2region[depart] === region)) {
        setUserInTheSameRegion(true);
      } else {
        setUserInTheSameRegion(false);
      }
    } else setCurrentTab("region");
  }, [user]);

  return (
    <>
      <div className="flex flex-col w-full mt-4">
        <div className="flex flex-1 flex-col lg:flex-row mb-4 border-b">
          <nav className="px-3 flex flex-1  ">
            {user.role === ROLES.REFERENT_REGION ? (
              <>
                <TabItem name="region" setCurrentTab={setCurrentTab} active={currentTab === "region"}>
                  Ma région
                </TabItem>
                <TabItem name="department" setCurrentTab={setCurrentTab} active={currentTab === "department"}>
                  <FilterDepartment onChange={(event) => updateFilter({ department: [event.target.value] })} value={filter.department} filter={filter} />
                </TabItem>
              </>
            ) : (
              <>
                {user.department.map((department) => (
                  <TabItem key={department} name={department} setCurrentTab={setCurrentTab} active={currentTab === department}>
                    {department} ({getDepartmentNumber(department)})
                  </TabItem>
                ))}
                {userInTheSameRegion ? (
                  <TabItem name="region" setCurrentTab={setCurrentTab} active={currentTab === "region"}>
                    Équipe régionale
                  </TabItem>
                ) : (
                  user.department.map((department) => (
                    <TabItem
                      key={department2region[department]}
                      name={department2region[department]}
                      setCurrentTab={setCurrentTab}
                      active={currentTab === department2region[department]}>
                      Équipe régionale ({department2region[department]})
                    </TabItem>
                  ))
                )}
              </>
            )}
          </nav>
        </div>
        {user.role === ROLES.REFERENT_REGION && currentTab === "department" ? <InfoDepartement department={filter?.department?.length ? filter.department[0] : null} /> : null}
        {user.role === ROLES.REFERENT_DEPARTMENT && user.department.includes(currentTab) ? <InfoDepartement department={currentTab} /> : null}
      </div>
    </>
  );
}

const TabItem = ({ name, active, setCurrentTab, children }) => (
  <div
    onClick={() => setCurrentTab(name)}
    className={`px-3 py-2 cursor-pointer text-coolGray-500  hover:text-snu-purple-800 hover:border-b-[3px] hover:border-snu-purple-800
      ${active && "text-snu-purple-800 font-bold border-b-[3px] border-snu-purple-800"}`}>
    {children}
  </div>
);
