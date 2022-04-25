import React, { useEffect, useState } from "react";
import InfoDepartement from "./InfoDepartment";
import FilterDepartment from "./filter/FilterDepartment";
import { useSelector } from "react-redux";
import { ROLES, getDepartmentNumber } from "../../../utils";

export default function Nav({ filter, updateFilter }) {
  const user = useSelector((state) => state.Auth.user);
  const [currentTab, setCurrentTab] = useState();

  useEffect(() => {
    if (currentTab === "region") {
      updateFilter({ department: [], role: [ROLES.REFERENT_REGION, ROLES.VISITOR] });
    } else if (currentTab === "department") {
      if (user.role === ROLES.REFERENT_DEPARTMENT) {
        updateFilter({ department: [user.department], role: [ROLES.REFERENT_DEPARTMENT] });
      } else {
        updateFilter({ role: [ROLES.REFERENT_DEPARTMENT] });
      }
    }
  }, [currentTab]);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      setCurrentTab("department");
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
                <TabItem name="department" setCurrentTab={setCurrentTab} active={currentTab === "department"}>
                  {user.department} ({getDepartmentNumber(user.department)})
                </TabItem>
                <TabItem name="region" setCurrentTab={setCurrentTab} active={currentTab === "region"}>
                  Équipe régionale
                </TabItem>
              </>
            )}
          </nav>
        </div>
        {currentTab === "department" && <InfoDepartement department={filter?.department?.length ? filter.department[0] : null} />}
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
