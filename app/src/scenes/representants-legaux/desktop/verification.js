import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { COHESION_STAY_LIMIT_DATE } from "snu-lib/constants";
import { getDepartmentByZip } from "snu-lib/region-and-departments";
import { translate, translateGrade } from "snu-lib/translation";
import Check from "../components/Check";
import api from "../../../services/api";
import { API_VERIFICATION, isReturningParent } from "../commons";
import { BorderButton, PlainButton } from "../components/Buttons";
import { supportURL } from "../../../config";

export default function Verification({ step, parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [certified, setCertified] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    if (young) {
      if (isReturningParent(young, parentId)) {
        const route = parentId === 2 ? "done-parent2" : "done";
        history.push(`/representants-legaux/${route}?token=${token}`);
        return;
      }

      setCertified(young.parent1DataVerified);
    }
  }, [young]);

  if (!young) return <Loader />;

  const sections = sectionsData(young).map(Section);

  async function onNext() {
    if (parentId === 1) {
      setSaving(true);
      setError(null);
      if (certified) {
        if (await saveParentCertified()) {
          history.push(`/representants-legaux/consentement?token=${token}`);
        }
      } else {
        setError("Vous devez certifier l'exactitude de ces renseignements avant de pouvoir continuer.");
      }
      setSaving(false);
    } else {
      history.push(`/representants-legaux/consentement-parent2?token=${token}`);
    }
  }
  function onPrevious() {
    const route = parentId === 2 ? "presentation-parent2" : "presentation";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }

  async function saveParentCertified() {
    try {
      const { code, ok } = await api.post(API_VERIFICATION + `?token=${token}`, { verified: true });
      if (!ok) {
        setError("Une erreur s'est produite" + (code ? " : " + translate(code) : ""));
        return false;
      } else {
        return true;
      }
    } catch (e) {
      setError("Une erreur s'est produite" + (e.code ? " : " + translate(e.code) : ""));
      return false;
    }
  }

  return (
    <>
      <Navbar step={step} />
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
          <h1 className="leading-40 mb-2 text-[24px] font-bold leading-[32px] text-[#21213F]">Voici les informations transmises par {young.firstName}</h1>

          <div className="mb-[32px] mt-2 text-[14px] leading-[20px] text-[#666666]">
            {parentId === 2 ? (
              <p>
                La validité de ces informations a été vérifiée par {young.parent1FirstName} {young.parent1LastName}. Pour toute demande de correction, adressez-vous à{" "}
                {young.firstName} ou à {young.parent1FirstName}.
              </p>
            ) : (
              <>
                <p>Veuillez vérifier la validité de ces informations.</p>
                <p>En cas d’erreur, {young.firstName} peut modifier ces informations à partir de son dossier d’inscription.</p>
                <p>
                  <a
                    href={`${supportURL}/base-de-connaissance/le-volontaire-a-fait-une-erreur-sur-son-dossier`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:underline">
                    Je vois des informations incorrectes
                  </a>
                </p>
              </>
            )}
          </div>

          <div className="border-b-solid border-b-[1px] border-b-[#E5E5E5]">{sections}</div>

          {parentId === 1 && (
            <>
              <div className="flex items-center pt-[32px]">
                <Check checked={certified} onChange={(e) => setCertified(e)}>
                  Je certifie l’exactitude de ces renseignements. Si ces informations ne sont pas exactes, consultez{" "}
                  <a
                    href={`${supportURL}/base-de-connaissance/le-volontaire-a-fait-une-erreur-sur-son-dossier`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:underline">
                    cet article
                  </a>{" "}
                  avant de valider.
                </Check>
              </div>
              {error && <div className="mt-2 ml-[40px] text-[14px] leading-[19px] text-[#CE0500]">{error}</div>}
            </>
          )}

          <div className="justify-content-end flex pt-[32px]">
            <BorderButton className="mr-2" onClick={onPrevious}>
              Précédent
            </BorderButton>
            <PlainButton onClick={onNext} spinner={saving}>
              Suivant
            </PlainButton>
          </div>
        </div>
      </div>
    </>
  );
}

function Section(section, idx) {
  if (section.subtitle) {
    return SectionSubtitle(section, idx);
  }

  const fields = section.fields.map(SectionField);

  return (
    <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px]" key={idx.toString()}>
      <h2 className="mt-0 mb-[19px] text-[18px] font-bold leading-[32px]">{section.title}</h2>
      {fields}
    </div>
  );
}

function SectionSubtitle(section, idx) {
  return (
    <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px]" key={idx.toString()}>
      <h2 className="font-400 mt-0 mb-[19px] text-[18px] leading-[32px]">
        <b>{section.title} : </b> {section.subtitle}
      </h2>
    </div>
  );
}

function SectionField(field, idx) {
  let content;
  if (field.subtitle) {
    content = <div className="font-400 text-[16px] text-[#666666]">{field.subtitle} :</div>;
  } else {
    content = (
      <>
        <div className="font-400 text-[16px] text-[#666666]">{field.label} :</div>
        <div className="font-400 text-[16px] text-[#161616]">{field.value ? field.value : "-"}</div>
      </>
    );
  }

  return (
    <div className={"justify-content-between mb-[15px] flex items-center" + (field.separator ? " border-t-solid m-t-2 border-t-[1px] border-t-[#E5E5E5] pt-2" : "")} key={idx}>
      {content}
    </div>
  );
}

function specialSituations(young) {
  let specials = [];

  if (young.handicap === "true") {
    specials.push({ label: "En situation de handicap", value: "Oui" });
  }

  if (young.allergies === "true") {
    specials.push({ label: "A des allergies", value: "Oui" });
  }
  if (young.reducedMobilityAccess === "true") {
    specials.push({ label: "A besoin d’un aménagement pour mobilité réduite", value: "Oui" });
  }
  if (young.ppsBeneficiary === "true") {
    specials.push({ label: "Bénéficie d'un PPS (projet personnalisé de scolarisation", value: "Oui" });
  }
  if (young.paiBeneficiary === "true") {
    specials.push({ label: "Bénéficie d'un PAI (projet d'accueil individualisé", value: "Oui" });
  }
  if (young.specificAmenagment === "true") {
    specials.push({ label: "A besoin d'aménagements spécifiques", value: young.specificAmenagmentType ? ": " + young.specificAmenagmentType : "Oui" });
  }
  if (young.handicapInSameDepartment === "true") {
    specials.push({ label: "Doit être affecté dans son département de résidence", value: "Oui" });
  }
  if (young.highSkilledActivity === "true") {
    specials.push({ label: "A une activité de haut niveau", value: "Oui" });
  }
  if (young.highSkilledActivityInSameDepartment === "true") {
    specials.push({ label: "Doit être affecté dans son département de résidence (activité de haut niveau)", value: "Oui" });
  }

  return specials;
}

function sectionsData(young) {
  // --- foreign address
  let foreignAddress = [];
  let titleAddress = [];
  if (young.foreignAddress) {
    titleAddress.push({ separator: true, subtitle: "Adresse de l'hébergeur" });

    foreignAddress.push(
      { separator: true, subtitle: "Adresse à l'étranger" },
      { label: "Adresse", value: young.foreignAddress },
      { label: "Code postal", value: young.foreignZip },
      { label: "Ville", value: young.foreignCity },
      { label: "Pays", value: young.foreignCountry },
    );
  }

  // --- situation
  let situation = [];
  if (young.status === "REINSCRIPTION") {
    // situation.push({ separator: false });
    if (young.schooled === "true") {
      situation.push(
        { label: "Pays de l'établissement", value: young.schoolCountry },
        { label: "Ville de l'établissement", value: young.schoolCity },
        { label: "Nom de l'établissement", value: young.schoolName },
      );
    } else {
      situation.push({ label: "Code postal", value: young.zip }, { label: "Pays de résidence", value: young.country });
    }
  } else {
    situation.push({ separator: true, subtitle: "Situation" });
    if (young.schooled === "true") {
      situation.push(
        { label: "Situation scolaire", value: translate(young.situation) },
        { label: "Pays de l'établissement", value: young.schoolCountry },
        { label: "Ville de l'établissement", value: young.schoolCity },
        { label: "Nom de l'établissement", value: young.schoolName },
      );
    } else {
      situation.push({ label: "Situation", value: translate(young.situation) }, { label: "Code postal", value: young.zip }, { label: "Pays de résidence", value: young.country });
    }
    // --- situations particulières
    const specials = specialSituations(young);
    if (specials.length > 0) {
      situation = [...situation, { separator: true, subtitle: "Situation particulière" }, ...specials];
    } else {
      situation.push({ label: "Situation particulière", value: "Non" });
    }
  }

  // --- parent 2
  let secondParent = [];

  if (young.parent2Status !== null && young.parent2Status !== undefined && young.parent2Status.trim().length > 0) {
    secondParent.push(
      { separator: true, subtitle: "2ème parent" },
      { label: "Son lien", value: translate(young.parent2Status) },
      { label: "Son prénom", value: young.parent2FirstName },
      { label: "Son nom", value: young.parent2LastName },
      // { label: "Moyen de contact favori", value: "?" },
      { label: "Son email", value: young.parent2Email },
      { label: "Son téléphone", value: young.parent2Phone },
    );
  }
  return [
    {
      title: "Ses informations personnelles",
      fields: [
        { label: "Prénom", value: young.firstName },
        { label: "Nom", value: young.lastName },
        { label: "Email", value: young.email },
        { label: "Niveau de scolarité", value: translateGrade(young.grade) },
        { label: "Date de naissance", value: dayjs(young.birthdateAt).locale("fr").format("DD/MM/YYYY") },
      ],
    },
    {
      title: "Séjour de cohésion",
      subtitle: COHESION_STAY_LIMIT_DATE[young.cohort],
    },
    {
      title: "Son profil",
      fields:
        young.status === "REINSCRIPTION"
          ? situation
          : [
              { label: "Pays de naissance", value: young.birthCountry },
              { label: "Département de naissance", value: getDepartmentByZip(young.birthCityZip) },
              { label: "Ville de naissance", value: young.birthCity },
              { label: "Sexe", value: translate(young.gender) },
              { label: "Téléphone", value: young.phone },
              ...titleAddress,
              { label: "Adresse de résidence", value: young.address ? young.address + (young.complementAddress ? "<br/>" + young.complementAddress : "") : undefined },
              { label: "Code postal", value: young.zip },
              { label: "Ville", value: young.city },
              ...foreignAddress,
              ...situation,
            ],
    },
    {
      title: young.firstName + " " + young.lastName + " a déclaré les représentants légaux suivants détenteurs de l'autorité parentale\u00A0:",
      fields: [
        { label: "Votre lien", value: translate(young.parent1Status) },
        { label: "Votre prénom", value: young.parent1FirstName },
        { label: "Votre nom", value: young.parent1LastName },
        // { label: "Moyen de contact favori", value: "?" },
        { label: "Votre email", value: young.parent1Email },
        { label: "Votre téléphone", value: young.parent1Phone },
        ...secondParent,
      ],
    },
  ];
}
