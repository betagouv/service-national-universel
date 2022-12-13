import { useSelector } from "react-redux";
import DesktopView from "./desktop";
import MobileView from "./mobile";
import React, { useEffect, useState } from "react";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState({});
  const [viewProps, setViewProps] = useState({ onSave, onToggleDomain, hasDomainSelected, changeMissionFormat, changePeriod, changeMobilityTransport });

  useEffect(() => {
    console.log("SET DATA = ", young);
    if (young) {
      setData({
        domains: young.domains ? young.domains : [],
        missionFormat: young.missionFormat,
        period: young.period,
        periodRanking: young.periodRanking ? young.periodRanking : [],
        mobilityTransport: young.mobilityTransport ? young.mobilityTransport : [],
        professionalProject: young.professionalProject,
        professionnalProjectPrecision: young.professionnalProjectPrecision,
      });
    } else {
      setData({ domains: [] });
    }
  }, [young]);

  async function onSave() {
    console.log("TODO: save");
  }

  function hasDomainSelected(type) {
    return data.domains && data.domains.includes(type);
  }

  function onToggleDomain(type) {
    console.log("OnToggleDomain: ", JSON.stringify(data));
    const idx = data.domains.indexOf(type);
    if (idx >= 0) {
      let domains = data.domains;
      domains.splice(idx, 1);
      setData({ ...data, domains });
    } else {
      if (data.domains.length < 3) {
        let domains = data.domains;
        domains.push(type);
        setData({ ...data, domains });
      }
    }
  }

  function changeMissionFormat(missionFormat) {
    console.log(JSON.stringify(data, null, 4));
    setData({ ...data, missionFormat });
  }

  function changePeriod(period) {
    setData({ ...data, period });
  }

  function changeMobilityTransport(mobilityTransport) {
    setData({ ...data, mobilityTransport });
  }

  function changeProfessionalProject(professionalProject) {
    let newData = { ...data, professionalProject };
    if (data.professionalProject !== professionalProject) {
      newData.professionalProjectPrecision = null;
    }
    setData(newData);
  }

  function changeProfessionalProjectPrecision(professionalProjectPrecision) {
    setData({ ...data, professionalProjectPrecision });
  }

  return (
    <>
      <div className="hidden md:flex flex-1">
        <DesktopView
          young={data}
          onToggleDomain={onToggleDomain}
          onSave={onSave}
          hasDomainSelected={hasDomainSelected}
          changePeriod={changePeriod}
          changeMissionFormat={changeMissionFormat}
          changeMobilityTransport={changeMobilityTransport}
          changeProfessionalProject={changeProfessionalProject}
          changeProfessionalProjectPrecision={changeProfessionalProjectPrecision}
        />
      </div>
      <div className="flex md:hidden">
        <MobileView young={data} {...viewProps} />
      </div>
    </>
  );
}
