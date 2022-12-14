import { useSelector } from "react-redux";
import DesktopView from "./desktop";
import MobileView from "./mobile";
import React, { useEffect, useState } from "react";
import { TRANSPORT } from "snu-lib";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState({});

  useEffect(() => {
    console.log("SET DATA = ", young);
    if (young) {
      setData({
        domains: young.domains ? young.domains : [],
        missionFormat: young.missionFormat,
        period: young.period,
        periodRanking: young.periodRanking ? young.periodRanking : [],
        mobilityTransport: young.mobilityTransport ? young.mobilityTransport : [],
        mobilityTransportOther: young.mobilityTransport && young.mobilityTransportOther ? young.mobilityTransportOther : "",
        professionalProject: young.professionalProject,
        professionnalProjectPrecision: young.professionnalProjectPrecision,
        desiredLocationToggle: young.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0,
        desiredLocation: young.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0 ? young.desiredLocation.trim() : "",
        engaged: young.engaged === "true",
        engagedDescription: young.engagedDescription && young.engaged === "true" ? young.engagedDescription : "",
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
    if (mobilityTransport.includes(TRANSPORT.OTHER)) {
      setData({ ...data, mobilityTransport });
    } else {
      setData({ ...data, mobilityTransport, mobilityTransportOther: "" });
    }
  }

  function changeMobilityTransportOther(mobilityTransportOther) {
    setData({ ...data, mobilityTransportOther });
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

  function toggleDesiredLocation(val) {
    if (val) {
      setData({ ...data, desiredLocationToggle: true });
    } else {
      setData({ ...data, desiredLocationToggle: false, desiredLocation: "" });
    }
  }

  function changeDesiredLocation(desiredLocation) {
    setData({ ...data, desiredLocation });
  }

  function toggleEngaged(engaged) {
    if (engaged) {
      setData({ ...data, engaged });
    } else {
      setData({ ...data, engaged, engagedDescription: "" });
    }
  }

  function changeEngagedDescription(engagedDescription) {
    setData({ ...data, engagedDescription });
  }

  function changePeriodRanking(periodRanking) {
    setData({ ...data, periodRanking });
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
          changePeriodRanking={changePeriodRanking}
          changeMissionFormat={changeMissionFormat}
          changeMobilityTransport={changeMobilityTransport}
          changeProfessionalProject={changeProfessionalProject}
          changeProfessionalProjectPrecision={changeProfessionalProjectPrecision}
          toggleDesiredLocation={toggleDesiredLocation}
          changeDesiredLocation={changeDesiredLocation}
          toggleEngaged={toggleEngaged}
          changeEngagedDescription={changeEngagedDescription}
          changeMobilityTransportOther={changeMobilityTransportOther}
        />
      </div>
      <div className="flex md:hidden">
        <MobileView young={data} />
      </div>
    </>
  );
}
