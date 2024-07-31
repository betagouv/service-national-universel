import React, { useEffect, useState } from "react";
import InfoDepartement from "./InfoDepartment";
import FilterDepartment from "./filter/FilterDepartment";
import { useSelector } from "react-redux";
import { ROLES, getDepartmentNumber, department2region } from "snu-lib";

export default function Nav({ filter, updateFilter, currentTab, setCurrentTab }) {
  const user = useSelector((state) => state.Auth.user);
  const [userInTheSameRegion, setUserInTheSameRegion] = useState();

  useEffect(() => {
    if (currentTab === "region") {
      updateFilter({ department: [] });
    } else if (user.department.map((department) => department2region[department]).includes(currentTab)) {
      updateFilter({ department: [], region: [currentTab] });
    } else if (user.department.includes(currentTab) || currentTab === "department") {
      if (user.role === ROLES.REFERENT_DEPARTMENT) {
        updateFilter({ department: [currentTab], region: [] });
      }
    }
  }, [currentTab]);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      const region = department2region[user.department[0]];
      if (user.department.every((depart) => department2region[depart] === region)) {
        setUserInTheSameRegion(true);
      } else {
        setUserInTheSameRegion(false);
      }
    }
  }, [user]);

  return (
    <>
      <div className="mt-4 flex w-full flex-col">
        <div className="mb-4 flex flex-1 flex-col border-b lg:flex-row">
          <nav className="flex flex-1 px-3  ">
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
    className={`cursor-pointer px-3 py-2 text-coolGray-500  hover:border-b-[3px] hover:border-blue-600 hover:text-blue-600
      ${active && "border-b-[3px] border-blue-600 font-bold text-blue-600"}`}>
    {children}
  </div>
);
