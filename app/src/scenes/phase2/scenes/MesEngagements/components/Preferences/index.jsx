import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import { setYoung } from "@/redux/auth/actions";
import plausibleEvent from "@/services/plausible";
import api from "@/services/api";
import { TRANSPORT, translate, PROFESSIONNAL_PROJECT, PERIOD } from "snu-lib";
import View from "./View";
import { PREF_FORMATS } from "./commons";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState({
    domains: young?.domains || [],
    missionFormat: young?.missionFormat,
    period: young?.period,
    periodRanking: young?.periodRanking || [],
    mobilityTransport: young?.mobilityTransport || [],
    mobilityTransportOther: young?.mobilityTransport && young.mobilityTransportOther ? young.mobilityTransportOther : "",
    professionnalProject: young?.professionnalProject,
    professionnalProjectPrecision: young?.professionnalProjectPrecision || "",
    desiredLocationToggle: young?.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0,
    desiredLocation: young?.desiredLocation !== null && young.desiredLocation !== undefined && young.desiredLocation.trim().length > 0 ? young.desiredLocation.trim() : "",
    engaged: young?.engaged === "true",
    engagedDescription: young?.engagedDescription && young.engaged === "true" ? young.engagedDescription : "",
    city: young?.city,
    schoolCity: young?.schoolCity,
    schooled: young?.schooled,
    mobilityNearHome: young?.mobilityNearHome === "true",
    mobilityNearSchool: young?.mobilityNearSchool === "true",
    mobilityNearRelative: young?.mobilityNearRelative === "true",
    mobilityNearRelativeName: young?.mobilityNearRelativeName || "",
    mobilityNearRelativeAddress: young?.mobilityNearRelativeAddress || "",
    mobilityNearRelativeZip: young?.mobilityNearRelativeZip || "",
    mobilityNearRelativeCity: young?.mobilityNearRelativeCity || "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

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

    return { ...cleanData };
  }

  async function onSave() {
    setSaving(true);
    if (validateBeforeSave()) {
      try {
        plausibleEvent("Phase2/CTA préférences missions - Enregistrer préférences");
        const { ok, code, data: updatedYoung } = await api.put("/young/account/mission-preferences", getCleanedYoung());
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
    }
    setSaving(false);
  }

  function validateBeforeSave() {
    let validated = true;
    let errors = {};

    console.log("validate data: ", data);

    if (data.domains.length < 3) {
      errors.domains = "Vous devez choisir 3 thématiques.";
      validated = false;
    }

    if (!Object.keys(PROFESSIONNAL_PROJECT).includes(data.professionnalProject)) {
      errors.professionnalProject = "Vous devez préciser votre projet professionnel";
      validated = false;
    }
    if (data.professionnalProject !== PROFESSIONNAL_PROJECT.UNKNOWN) {
      if (data.professionnalProjectPrecision === null || data.professionnalProjectPrecision === undefined || data.professionnalProjectPrecision.trim().length === 0) {
        errors.professionnalProjectPrecision = "Vous devez indiquer une précision.";
        validated = false;
      }
    }

    if (data.desiredLocationToggle) {
      if (data.desiredLocation === null || data.desiredLocation === undefined || data.desiredLocation.trim().length === 0) {
        errors.desiredLocation = "Vous devez préciser l'endroit désiré.";
        validated = false;
      }
    }

    if (data.engaged) {
      if (data.engagedDescription === null || data.engagedDescription === undefined || data.engagedDescription.trim().length === 0) {
        errors.engagedDescription = "Vous devez préciser votre activité bénévole.";
        validated = false;
      }
    }

    if (!Object.keys(PREF_FORMATS).includes(data.missionFormat)) {
      errors.missionFormat = "Vous devez préciser votre format préféré";
      validated = false;
    }

    if (!Object.keys(PERIOD).includes(data.period)) {
      errors.period = "Vous devez préciser une période de réalisation de la mission";
      validated = false;
    }

    if (data.mobilityTransport.includes(TRANSPORT.OTHER)) {
      if (data.mobilityTransportOther === null || data.mobilityTransportOther === undefined || data.mobilityTransportOther.trim().length === 0) {
        errors.mobilityTransportOther = "Vous devez préciser votre autre moyen de transport privilégié.";
        validated = false;
      }
    }

    if (data.mobilityNearRelative) {
      if (data.mobilityNearRelativeName === null || data.mobilityNearRelativeName === undefined || data.mobilityNearRelativeName.trim().length === 0) {
        errors.mobilityNearRelativeName = "Vous devez préciser le nom de votre proche.";
        validated = false;
      }
      if (data.mobilityNearRelativeAddress === null || data.mobilityNearRelativeAddress === undefined || data.mobilityNearRelativeAddress.trim().length === 0) {
        errors.mobilityNearRelativeAddress = "Vous devez préciser l'adresse de votre proche.";
        validated = false;
      }
      if (data.mobilityNearRelativeZip === null || data.mobilityNearRelativeZip === undefined || data.mobilityNearRelativeZip.trim().length === 0) {
        errors.mobilityNearRelativeZip = "Vous devez préciser le code postal de votre proche.";
        validated = false;
      }
      if (data.mobilityNearRelativeCity === null || data.mobilityNearRelativeCity === undefined || data.mobilityNearRelativeCity.trim().length === 0) {
        errors.mobilityNearRelativeCity = "Vous devez préciser la ville de votre proche.";
        validated = false;
      }
    }

    setErrors(errors);
    return validated;
  }

  function hasDomainSelected(type) {
    return data.domains && data.domains.includes(type);
  }

  function onToggleDomain(type) {
    const idx = data.domains.indexOf(type);
    let domains = [...data.domains];
    if (idx >= 0) {
      domains.splice(idx, 1);
      setData({ ...data, domains });
    } else {
      let domains = data.domains.length >= 3 ? data.domains.slice(1, 4) : [...data.domains];
      domains.push(type);
      setData({ ...data, domains });
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

  return <View young={data} onToggleDomain={onToggleDomain} onSave={onSave} saving={saving} hasDomainSelected={hasDomainSelected} onChange={onChangeYoung} errors={errors} />;
}
