import React, { useEffect, useState } from "react";
import DesktopView from "./desktop";
import MobileView from "./mobile";
import { useSelector } from "react-redux";
import { getCohortByName } from "../../services/cohort.service";

export default function View() {
  const young = useSelector((state) => state.Auth.young);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getCohortByName(young.cohort);
      setCohort(data);
    })();
  }, []);

  return (
    <>
      <div className="hidden md:flex flex-1">
        <DesktopView young={young} cohort={cohort} />
      </div>
      <div className="flex md:hidden ">
        <MobileView young={young} cohort={cohort} />
      </div>
    </>
  );
}
