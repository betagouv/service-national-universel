import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { computeSejourDate } from "../commons";
import { getDepartmentByZip } from "snu-lib/region-and-departments";

export default function Verification({ step }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);

  if (!young) return <Loader />;

  const sections = sectionsData(young).map(Section);

  function onNext() {
    history.push(`/representants-legaux/consentement?token=${token}`);
  }
  function onPrevious() {
    history.push(`/representants-legaux/presentation?token=${token}`);
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
                Je vois des informations incorrectes
              </a>
            </p>
          </div>

          {sections}

          <div className="flex justify-content-end pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer border-[1px] border-solid border-[#000091] text-[#000091] mr-2" onClick={onPrevious}>
              Précédent
            </button>
            <button className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white" onClick={onNext}>
              Suivant
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section(section) {
  if (section.subtitle) {
    return SectionSubtitle(section);
  }

  const fields = section.fields.map(SectionField);

  return (
    <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
      <h2 className="mt-0 mb-[19px] font-bold text-[18px] leading-[32px]">{section.title}</h2>
      {fields}
    </div>
  );
}

function SectionSubtitle(section) {
  return (
    <div className="pt-[32px] border-t-[1px] border-t-[#E5E5E5] border-t-solid">
      <h2 className="mt-0 mb-[19px] font-400 text-[18px] leading-[32px]">
        <b>{section.title} : </b> {section.subtitle}
      </h2>
    </div>
  );
}

function SectionField(field) {
  return (
    <div className="flex justify-content-between items-center mb-[15px]">
      <div className="text-[16px] font-400 text-[#666666]">{field.label} :</div>
      <div className="text-[16px] font-400 text-[#161616]">{field.value ? field.value : "-"}</div>
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
  if (young.handicap === "true") {
    specials.push(young.firstName + " a un handicap");
  }
  if (young.handicap === "true") {
    specials.push(young.firstName + " a un handicap");
  }

  return specials;
}

function sectionsData(young) {
  return [
    {
      title: "Ses informations personnelles",
      fields: [
        { label: "Prénom", value: young.firstName },
        { label: "Nom", value: young.lastName },
        { label: "Email", value: young.email },
        { label: "Niveau de scolarité", value: young.grade },
        { label: "Date de naissance", value: dayjs(young.birthdateAt).locale("fr").format("DD/MM/YYYY") },
      ],
    },
    {
      title: "Séjour de cohésion",
      subtitle: "du " + computeSejourDate(young.cohort),
    },
    {
      title: "Son profil",
      fields: [
        { label: "Pays de naissance", value: young.birthCountry },
        { label: "Département de naissance", value: getDepartmentByZip(young.birthCityZip) },
        { label: "Ville de naissance", value: young.birthCity },
        { label: "Sexe", value: young.gender },
        { label: "Téléphone", value: young.phone },
        { label: "Adresse de résidence", value: young.address ? young.address + (young.complementAddress ? "<br/>" + young.complementAddress : "") : undefined },
        { label: "Code postal", value: young.zip },
        { label: "Ville", value: young.city },
        { label: "Sa situation scolaire", value: young.situation },
        { label: "Pays de l'établissement", value: young.schoolCountry },
        { label: "Ville de l'établissement", value: young.schoolCity },
        { label: "Nom de l'établissement", value: young.schoolName },
        { label: "Situation particulière", value: specialSituations(young) },
      ],
    },
    {
      title: "Ses représentants légaux",
      fields: [
        { label: "Lien", value: young.parent1Status },
        { label: "Prénom", value: young.parent1FirstName },
        { label: "Nom", value: young.parent1LastName },
        // { label: "Moyen de contact favori", value: "?" },
        { label: "Email", value: young.paren1Email },
        { label: "Téléphone", value: young.paren1Phone },
      ],
    },
  ];
}
