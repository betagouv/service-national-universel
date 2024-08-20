import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import "dayjs/locale/fr";
import { getDepartmentByZip, translate, translateGrade, getCohortPeriod, YOUNG_SOURCE } from "snu-lib";
import { getCohort } from "@/utils/cohorts";
import api from "../../../services/api";
import { API_VERIFICATION, isReturningParent } from "../commons";
import { concatPhoneNumberWithZone } from "snu-lib";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import Check from "../components/Check";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { supportURL } from "../../../config";
import plausibleEvent from "@/services/plausible";
import { SignupButtons } from "@snu/ds/dsfr";

export default function Verification({ step, parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [certified, setCertified] = React.useState(young?.parent1DataVerified);
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const isCLE = YOUNG_SOURCE.CLE === young?.source;
  const hasHandicap =
    young?.handicap === "true" ||
    young?.allergies === "true" ||
    young?.ppsBeneficiary === "true" ||
    young?.paiBeneficiary === "true" ||
    young?.specificAmenagment === "true" ||
    young?.reducedMobilityAccess === "true" ||
    young?.handicapInSameDepartment === "true" ||
    young?.highSkilledActivity === "true" ||
    young?.highSkilledActivityInSameDepartment === "true";

  if (!young) return <Loader />;

  if (isReturningParent(young, parentId)) {
    const route = parentId === 2 ? "done-parent2" : "done";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }

  async function onNext() {
    if (parentId === 1) {
      setSaving(true);
      setError(null);
      if (certified) {
        if (await saveParentCertified()) {
          plausibleEvent("Phase0/CTA representant legal - continuer etape 2");
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
      <DSFRContainer title={`Voici les informations transmises par ${young.firstName}`}>
        <div className="mb-[32px] mt-2 space-y-2 text-[14px] leading-[20px] text-[#666666]">
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
                <a href={`${supportURL}/base-de-connaissance/le-volontaire-a-fait-une-erreur-sur-son-dossier`} target="_blank" rel="noreferrer" className="">
                  Je vois des informations incorrectes
                </a>
              </p>
            </>
          )}
        </div>

        <ProfileDetails young={young} isCLE={isCLE} hasHandicap={hasHandicap} />

        {parentId === 1 && (
          <>
            <div className="flex items-center pt-[32px] mb-8">
              <Check checked={certified} onChange={(e) => setCertified(e)}>
                <span>
                  Je certifie l’exactitude de ces renseignements. Si ces informations ne sont pas exactes, consultez&nbsp;
                  <a href={`${supportURL}/base-de-connaissance/le-volontaire-a-fait-une-erreur-sur-son-dossier`} target="_blank" rel="noreferrer" className="">
                    cet article
                  </a>
                  &nbsp;avant de valider.
                </span>
              </Check>
            </div>
            {error && <div className="my-2 ml-[40px] text-[14px] leading-[19px] text-[#CE0500]">{error}</div>}
          </>
        )}
        <SignupButtons onClickNext={onNext} onClickPrevious={onPrevious} disabled={saving} />
      </DSFRContainer>
    </>
  );
}

const ProfileDetails = ({ young, isCLE, hasHandicap }) => {
  return (
    <>
      <hr className="mt-4" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="mt-2 text-lg font-bold text-[#161616]">Ses informations personnelles</h1>
        </div>
        <Details title="Prénom" value={young.lastName} />
        <Details title="Nom" value={young.firstName} />
        <Details title="Email" value={young.email} />
        <Details title="Son niveau scolaire" value={young.grade} />
        <Details title="Téléphone" value={concatPhoneNumberWithZone(young.phone, young.phoneZone)} />
        <hr className="mt-4" />
        <div className="flex flex-col gap-1">
          <h1 className="mt-2 text-lg font-bold text-[#161616]">Séjour de cohésion :</h1>
          <div className="text-lg font-normal text-[#161616]">{capitalizeFirstLetter(getCohortPeriod(getCohort(young?.cohort)))}</div>
        </div>
        <hr className="mt-4" />
        <div className="flex items-center justify-between">
          <h1 className="mt-2 text-lg font-bold text-[#161616]">Son Profil</h1>
        </div>
        <Details title="Pays de naissance" value={young.birthCountry} />
        <Details title="Ville de naissance" value={young.birthCity} />
        <Details title="Code postal de naissance" value={young.birthCityZip} />
        <Details title="Sexe" value={translate(young.gender)} />
        <Details title="Adresse de résidence" value={young.address} />
        <Details title="Ville de résidence" value={young.city} />
        <Details title="Code postal de résidence" value={young.zip} />
        {young.foreignAddress && (
          <>
            <div className="text-center text-base text-[#666666]">L&apos;adresse affichée ci-dessus est celle de votre hébergeur. Votre adresse à l&apos;étranger :</div>
            <Details title="Adresse à l'étranger" value={young.foreignAddress} />
            <Details title="Code postal à l'étranger" value={young.foreignZip} />
            <Details title="Ville à l'étranger" value={young.foreignCity} />
            <Details title="Pays à l'étranger" value={young.foreignCountry} />
          </>
        )}
        {!isCLE && <Details title={young.schooled === "true" ? "Sa situation scolaire" : "Sa situation"} value={translate(young.situation)} />}
        {hasHandicap ? (
          <>
            <Details title="Handicap" value={translate(young.handicap)} />
            <Details title="PPS" value={translate(young.ppsBeneficiary)} />
            <Details title="PAI" value={translate(young.paiBeneficiary)} />
            <Details title="Allergies" value={translate(young.allergies)} />
            <Details title="Aménagement spécifique" value={translate(young.specificAmenagment)} />
            <Details title="A besoin d'un aménagement pour mobilité réduite" value={translate(young.reducedMobilityAccess)} />
            <Details title="Doit être affecté dans son département de résidence" value={translate(young.handicapInSameDepartment)} />
            <Details title="Activités de haut niveau" value={translate(young.highSkilledActivity)} />
            <Details title="Doit être affecté dans son département de résidence (activité de haut niveau)" value={translate(young.highSkilledActivityInSameDepartment)} />
          </>
        ) : (
          <Details title="Situation particulière" value="Non" />
        )}
        <hr className="mt-4" />
        <p className="text-[14px] leading-[20px] text-[#666666] text-center">
          {young.firstName} {young.lastName} a déclaré le(s) détenteur(s) de l'autorité parentale suivant(s) :{" "}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="mt-2 text-lg font-bold text-[#161616]">Représentant(es) légal(e) 1 </h1>
          </div>
          <Details title="Votre lien" value={translate(young.parent1Status)} />
          <Details title="Votre prénom" value={young.parent1FirstName} />
          <Details title="Votre nom" value={young.parent1LastName} />
          <Details title="Votre e-mail" value={young.parent1Email} />
          <Details title="Votre téléphone" value={concatPhoneNumberWithZone(young.parent1Phone, young.parent1PhoneZone)} />
          {young.parent2Status ? (
            <>
              <div className="mt-4 flex items-center justify-between">
                <h1 className="text-lg font-bold text-[#161616]">Représentant(es) légal(e) 2 </h1>
              </div>
              <Details title="Votre lien" value={translate(young.parent2Status)} />
              <Details title="Votre prénom" value={young.parent2FirstName} />
              <Details title="Votre nom" value={young.parent2LastName} />
              <Details title="Votre e-mail" value={young.parent2Email} />
              <Details title="Votre téléphone" value={concatPhoneNumberWithZone(young.parent2Phone, young.parent2PhoneZone)} />
            </>
          ) : null}
        </div>
        <hr className="mt-4" />
      </div>
    </>
  );
};

const Details = ({ title, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <div className="mr-4 min-w-[90px] text-[#666666]">{`${title} :`}</div>
      <div className="text-right text-[#161616]">{value}</div>
    </div>
  );
};

function capitalizeFirstLetter(string) {
  if (string) return string.charAt(0).toUpperCase() + string.slice(1);
}
