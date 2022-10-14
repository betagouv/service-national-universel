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

export default function Verification({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [certified, setCertified] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    if (young) {
      if (isReturningParent(young, 1)) {
        history.push(`/representants-legaux/done?token=${token}&parent=1`);
        return;
      }

      setCertified(young.parent1DataVerified);
    }
  }, [young]);

  if (!young) return <Loader />;

  const sections = sectionsData(young).map(Section);

  async function onNext() {
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
  }
  function onPrevious() {
    history.push(`/representants-legaux/presentation?token=${token}`);
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
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] text-[#161616]">
          <h1 className="text-[24px] leading-[32px] font-bold leading-40 text-[#21213F] mb-2">Voici les informations transmises par {young.firstName}</h1>

          <div className="text-[14px] leading-[20px] text-[#666666] mb-[32px] mt-2">
            <p>Veuillez vérifier la validité de ces informations.</p>
            <p>En cas d’erreur, {young.firstName} peut modifier ces informations à partir de son dossier d’inscription.</p>
            <p>
              <a href="#" className="underline">
                {/* TODO: mettre le bon lien */}
                Je vois des informations incorrectes
              </a>
            </p>
          </div>

          {sections}

          <div className="flex items-center pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <Check checked={certified} onChange={(e) => setCertified(e)}>
              Je certifie l’exactitude de ces renseignements. Si ces informations ne sont pas exactes, consultez{" "}
              <a href="#" target="_blank" className="underline">
                {/* TODO: mettre le lien sur cet article */}
                cet article
              </a>{" "}
              avant de valider.
            </Check>
          </div>
          {error && <div className="text-[#CE0500] text-[14px] leading-[19px] mt-2 ml-[40px]">{error}</div>}

          <div className="flex justify-content-end pt-[32px]">
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
    <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid" key={idx.toString()}>
      <h2 className="mt-0 mb-[19px] font-bold text-[18px] leading-[32px]">{section.title}</h2>
      {fields}
    </div>
  );
}

function SectionSubtitle(section, idx) {
  return (
    <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid" key={idx.toString()}>
      <h2 className="mt-0 mb-[19px] font-400 text-[18px] leading-[32px]">
        <b>{section.title} : </b> {section.subtitle}
      </h2>
    </div>
  );
}

function SectionField(field, idx) {
  let content;
  if (field.subtitle) {
    content = <div className="text-[16px] font-400 text-[#666666]">{field.subtitle} :</div>;
  } else {
    content = (
      <>
        <div className="text-[16px] font-400 text-[#666666]">{field.label} :</div>
        <div className="text-[16px] font-400 text-[#161616]">{field.value ? field.value : "-"}</div>
      </>
    );
  }

  return (
    <div className={"flex justify-content-between items-center mb-[15px]" + (field.separator ? " border-t-[1px] border-t-[#E5E5E5] border-t-solid m-t-2 pt-2" : "")} key={idx}>
      {content}
    </div>
  );
}

function specialSituations(young) {
  let specials = [];

  if (young.allergies === "true") {
    specials.push(young.firstName + " a des allergies");
  }
  if (young.handicap === "true") {
    specials.push(young.firstName + " a un handicap");
  }
  if (young.reducedMobilityAccess === "true") {
    specials.push(young.firstName + " a besoin d’un aménagement pour mobilité réduite");
  }
  if (young.ppsBeneficiary === "true") {
    specials.push(young.firstName + " bénéficie d'un PPS (projet personnalisé de scolarisation");
  }
  if (young.paiBeneficiary === "true") {
    specials.push(young.firstName + " bénéficie d'un PAI (projet d'accueil individualisé");
  }
  if (young.specificAmenagment === "true") {
    specials.push(young.firstName + " a besoin d'aménagements spécifiques " + (young.specificAmenagmentType ? ": " + young.specificAmenagmentType : ""));
  }
  if (young.handicapInSameDepartment === "true") {
    specials.push(young.firstName + " doit être affecté dans son département de résidence");
  }
  if (young.highSkilledActivity === "true") {
    specials.push(young.firstName + " a une activité de haut niveau");
  }
  if (young.highSkilledActivityInSameDepartment === "true") {
    specials.push(young.firstName + " doit être affecté dans son département de résidence (activité de haut niveau)");
  }

  return specials;
}

function sectionsData(young) {
  // --- situation spéciales ?
  let specialSituation;
  const specials = specialSituations(young);
  if (specials.length > 0) {
    specialSituation = specials.map((s) => (
      <div className="text-right" key={s}>
        {s}
      </div>
    ));
  } else {
    specialSituation = "Non";
  }

  // --- foreign address
  let foreignAddress = [];
  let titleAddress = [];
  if (young.foreignAddress) {
    titleAddress.push({ separator: true, subtitle: "Adresse de l'hébergeur" });

    foreignAddress.push(
      { separator: true, subtitle: "Adresse à l&apos;étranger" },
      { label: "Adresse", value: young.foreignAddress },
      { label: "Code postal", value: young.foreignZip },
      { label: "Ville", value: young.foreignCity },
      { label: "Pays", value: young.foreignCountry },
    );
  }

  // --- situation
  let situation = [{ separator: true, label: young.schooled === "true" ? "Situation scolaire" : "Situation", value: translate(young.situation) }];
  if (young.schooled === "true") {
    situation.push(
      { label: "Pays de l'établissement", value: young.schoolCountry },
      { label: "Ville de l'établissement", value: young.schoolCity },
      { label: "Nom de l'établissement", value: young.schoolName },
    );
  }
  situation.push({ label: "Situation particulière", value: specialSituation });

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
      fields: [
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
