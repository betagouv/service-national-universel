import { useDispatch, useSelector } from "react-redux";
import DesktopView from "./desktop";
import MobileView from "./mobile";
import React, { useEffect, useState } from "react";
import { TRANSPORT } from "snu-lib";
import { capture } from "../../sentry";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../services/plausible";
import api from "../../services/api";
import { translate } from "../../utils";
import { setYoung } from "../../redux/auth/actions";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (young) {
      setData({
        domains: young.domains ? young.domains : [],
        missionFormat: young.missionFormat,
        period: young.period,
        periodRanking: young.periodRanking ? young.periodRanking : [],
        mobilityTransport: young.mobilityTransport ? young.mobilityTransport : [],
        mobilityTransportOther: young.mobilityTransport && young.mobilityTransportOther ? young.mobilityTransportOther : "",
        professionnalProject: young.professionnalProject,
        professionnalProjectPrecision: young.professionnalProjectPrecision,
        desiredLocationToggle: young.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0,
        desiredLocation: young.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0 ? young.desiredLocation.trim() : "",
        engaged: young.engaged === "true",
        engagedDescription: young.engagedDescription && young.engaged === "true" ? young.engagedDescription : "",
        city: young.city,
        schoolCity: young.schoolCity,
        schooled: young.schooled,
        mobilityNearHome: young.mobilityNearHome === "true",
        mobilityNearSchool: young.mobilityNearSchool === "true",
        mobilityNearRelative: young.mobilityNearRelative === "true",
        mobilityNearRelativeName: young.mobilityNearRelativeName,
        mobilityNearRelativeAddress: young.mobilityNearRelativeAddress,
        mobilityNearRelativeZip: young.mobilityNearRelativeZip,
        mobilityNearRelativeCity: young.mobilityNearRelativeCity,
      });
    } else {
      setData({ domains: [] });
    }
  }, [young]);

  function getCleanedYoung() {
    let cleanData = { ...data };
    delete cleanData.desiredLocationToggle;
    delete cleanData.city;
    delete cleanData.schooled;
    delete cleanData.schoolCity;

    for (const key of Object.keys(cleanData)) {
      if (cleanData[key] === true) {
        cleanData[key] = "true";
      } else if (cleanData[key] === false) {
        cleanData[key] = "false";
      }
    }

    return { ...young, ...cleanData };
  }

  async function onSave() {
    setSaving(true);
    try {
      plausibleEvent("Phase2/CTA préférences missions - Enregistrer préférences");
      const { ok, code, data: updatedYoung } = await api.put("/young", getCleanedYoung());
      if (ok) {
        if (updatedYoung) {
          dispatch(setYoung(updatedYoung));
        }
        toastr.success("Vos préférences ont bien été enregistrées.");
      } else {
        toastr.error("Une erreur s'est produite", translate(code));
      }
    } catch (err) {
      capture(err);
      toastr.error("Impossible d'enregistrer", "Une erreur est survenue lors de l'enregistrement de vos préférences. Veuillez réessayer dans quelques instants.");
    }
    setSaving(false);
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

  function onChangeYoung(name, value) {
    let newData = { ...data };
    switch (name) {
      case "mobilityTtransport":
        if (!value.includes(TRANSPORT.OTHER)) {
          newData.mobilityTransportOther = "";
        }
        break;
      case "engaged":
        if (!value) {
          newData.engagedDescription = "";
        }
        break;
      case "desiredLocationToggle":
        if (!value) {
          newData.desiredLocation = "";
        }
        break;
      case "professionnalProject":
        if (data.professionnalProject !== value) {
          newData.professionnalProjectPrecision = null;
        }
        break;
    }
    newData[name] = value;
    setData(newData);
  }

  return (
    <>
      <div className="hidden md:flex flex-1">
        <DesktopView young={data} onToggleDomain={onToggleDomain} onSave={onSave} saving={saving} hasDomainSelected={hasDomainSelected} onChange={onChangeYoung} />
      </div>
      <div className="flex md:hidden">
        <MobileView young={data} />
      </div>
    </>
  );
}
