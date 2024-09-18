import React, { useContext, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import FranceConnectButton from "../../inscription2023/components/FranceConnectButton";
import Input from "../../inscription2023/components/Input";
import ResponsiveRadioButton from "../../../components/dsfr/ui/buttons/RadioButton";
// TODO: mettre le Toggle dans les components génériques
import Toggle from "../../../components/dsfr/forms/toggle";
import { translate, PHONE_ZONES, isPhoneNumberWellFormated, YOUNG_SOURCE } from "snu-lib";
import Check from "../components/Check";
import { FRANCE, ABROAD, translateError, API_CONSENT, isReturningParent, CDN_BASE_URL } from "../commons";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import validator from "validator";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import api from "../../../services/api";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import plausibleEvent from "../../../services/plausible";
import AuthorizeBlock from "../components/AuthorizeBlock";
import { getAddress, getDataForConsentStep } from "../utils";
import PhoneField from "../../../components/dsfr/forms/PhoneField";
import { SignupButtons } from "@snu/ds/dsfr";

export default function Consentement({ step, parentId }) {
  const { young, token, classe, cohort } = useContext(RepresentantsLegauxContext);
  if (!young) return <Loader />;
  if (isReturningParent(young, parentId)) {
    const route = parentId === 2 ? "done-parent2" : "done";
    return <Redirect to={`/representants-legaux/${route}?token=${token}`} />;
  }
  return <ConsentementForm young={young} token={token} step={step} parentId={parentId} cohort={cohort} classe={classe} />;
}

function ConsentementForm({ young, token, step, parentId, cohort, classe }) {
  const history = useHistory();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = React.useState(false);
  const [imageRightsExplanationShown, setImageRightsExplanationShown] = useState(false);
  const [data, setData] = useState(getDataForConsentStep(young, parentId));

  // --- young
  const youngFullname = young.firstName + " " + young.lastName;

  // --- France Connect
  const isParentFromFranceConnect = young[`parent${parentId}FromFranceConnect`] === "true";
  const franceConnectCallbackUrl = "representants-legaux/france-connect-callback?parent=" + parentId + "&token=" + token;

  // --- address
  const formattedAddress =
    young?.address &&
    young.address + (young.addressComplement ? " " + young.addressComplement : "") + " " + young.zip + " " + young.city + (young.country ? ", " + young.country : "");

  const livesInFranceOption = [
    { label: "En France (Métropolitaine ou Outre-mer)", value: FRANCE },
    { label: "À l’étranger", value: ABROAD },
  ];

  function toggleImageRightsExplanationShown(e) {
    e.preventDefault();
    setImageRightsExplanationShown(!imageRightsExplanationShown);
  }

  function toggleConfirmAddress() {
    if (data.confirmAddress) {
      setData({
        ...data,
        confirmAddress: false,
        address: "",
        addressComplement: "",
        zip: "",
        city: "",
        country: "",
        addressVerified: "false",
        coordinatesAccuracyLevel: "",
        cityCode: "",
        region: "",
        department: "",
        location: "",
      });
    } else {
      const address = getAddress(young, parentId);
      setData({ ...data, confirmAddress: true, ...address });
    }
  }

  function onPrevious() {
    const route = parentId === 2 ? "verification-parent2" : "verification";
    history.push(`/representants-legaux/${route}?token=${token}`);
  }

  // --- submit
  async function onSubmit() {
    setSaving(true);
    setErrors({});
    const errors = validateData();
    if (errors) {
      setErrors(errors);
    } else if (await saveData()) {
      plausibleEvent("Phase0/CTA representant legal - valider");
      done();
    }
    setSaving(false);
  }

  function validateData() {
    let errors = {};
    let hasErrors = false;

    function validate(key, error, test) {
      if (test) {
        errors[key] = translateError(key + "." + error);
        hasErrors = true;
        return false;
      } else {
        return true;
      }
    }

    // --- identification
    validate("firstName", "empty", validator.isEmpty(data.firstName, { ignore_whitespace: true }));
    validate("lastName", "empty", validator.isEmpty(data.lastName, { ignore_whitespace: true }));
    if (validate("email", "empty", validator.isEmpty(data.email, { ignore_whitespace: true }))) {
      validate("email", "invalid", !validator.isEmail(data.email));
    }
    if (
      validate("phone", "empty", validator.isEmpty(data.phone, { ignore_whitespace: true })) ||
      validate("phoneZone", "empty", validator.isEmpty(data.phoneZone, { ignore_whitespace: true }))
    ) {
      validate("phone", "invalid", !isPhoneNumberWellFormated(data.phone, data.phoneZone));
    }

    // --- address
    let validAddress = validate("address", "empty", validator.isEmpty(data.address, { ignore_whitespace: true }));
    validAddress = validate("zip", "empty", validator.isEmpty(data.zip, { ignore_whitespace: true }));
    validAddress = validate("city", "empty", validator.isEmpty(data.city, { ignore_whitespace: true })) && validAddress;

    if (data.livesInFrance === ABROAD) {
      validAddress = validate("country", "empty", validator.isEmpty(data.country, { ignore_whitespace: true })) && validAddress;
    } else {
      validAddress = validate("zip", "invalid", !validator.isPostalCode(data.zip, "FR")) && validAddress;
    }

    if (!validAddress) {
      setData({ ...data, confirmAddress: false });
    }

    // --- accept
    if (parentId === 1) {
      validate("allowSNU", "not_choosen", data.allowSNU !== false && data.allowSNU !== true);

      if (data.allowSNU) {
        validate("rightOlder", "unchecked", data.rightOlder !== true);
        validate("healthForm", "unchecked", data.healthForm !== true);
        validate("vaccination", "unchecked", data.vaccination !== true);
        validate("internalRules", "unchecked", data.internalRules !== true);
        validate("personalData", "unchecked", data.personalData !== true);

        // validate("allowCovidAutotest", "not_choosen", data.allowCovidAutotest !== false && data.allowCovidAutotest !== true);
        validate("allowImageRights", "not_choosen", data.allowImageRights !== false && data.allowImageRights !== true);
      }
    } else {
      validate("allowImageRights", "not_choosen", data.allowImageRights !== false && data.allowImageRights !== true);
    }

    if (hasErrors) {
      return errors;
    } else {
      return null;
    }
  }

  async function saveData() {
    const ownAddress = data.address.trim() !== young.address || data.zip.trim() !== young.zip || data.city !== young.city;
    let address;
    if (ownAddress) {
      address = {
        [`parent${parentId}OwnAddress`]: "true",
        [`parent${parentId}Address`]: data.address.trim(),
        [`parent${parentId}ComplementAddress`]: data.addressComplement.trim(),
        [`parent${parentId}Zip`]: data.zip.trim(),
        [`parent${parentId}City`]: data.city.trim(),
        [`parent${parentId}Country`]: data.country.trim(),
        [`addressParent${parentId}Verified`]: data.addressVerified ? "true" : "false",
        [`parent${parentId}CityCode`]: data.cityCode.trim(),
        [`parent${parentId}Region`]: data.region.trim(),
        [`parent${parentId}Department`]: data.department.trim(),
        [`parent${parentId}Location`]: data.location,
      };
    } else {
      address = { [`parent${parentId}OwnAddress`]: "false" };
    }

    let body = {
      [`parent${parentId}FirstName`]: data.firstName.trim(),
      [`parent${parentId}LastName`]: data.lastName.trim(),
      [`parent${parentId}Email`]: validator.normalizeEmail(data.email.trim()),
      [`parent${parentId}PhoneZone`]: data.phoneZone.trim(),
      [`parent${parentId}Phone`]: data.phone.trim(),
      ...address,
    };

    if (parentId === 1) {
      body.parentAllowSNU = data.allowSNU ? "true" : "false";
      if (data.allowSNU) {
        body.parent1AllowImageRights = data.allowImageRights ? "true" : "false";
        body.rulesParent1 = "true";
      }
    } else {
      body.parent2AllowImageRights = data.allowImageRights ? "true" : "false";
    }

    if (young.status === "REINSCRIPTION") plausibleEvent("Phase0/CTA representant legal - Consentement valide - reinscription");
    else plausibleEvent("Phase0/CTA representant legal - Consentement valide");

    try {
      const { code, ok } = await api.post(API_CONSENT + `?token=${token}&parent=${parentId}`, body);
      if (!ok) {
        setErrors({ global: "Une erreur s'est produite" + (code ? " : " + translate(code) : "") });
        return false;
      } else {
        return true;
      }
    } catch (e) {
      setErrors({ global: "Une erreur s'est produite" + (e.code ? " : " + translate(e.code) : "") });
      return false;
    }
  }

  function done() {
    if (parentId === 1) {
      history.push(`/representants-legaux/done?token=${token}`);
    } else {
      history.push(`/representants-legaux/done-parent2?token=${token}`);
    }
  }

  const cohortYear = young.source === YOUNG_SOURCE.CLE ? classe?.schoolYear : new Date(cohort.dateStart).getFullYear();

  return (
    <>
      <Navbar step={step} />
      <DSFRContainer title="Apporter votre consentement">
        <div className="flex flex-col">
          {/* <h1 className="mb-1  text-[22px] font-bold text-[#21213F]">Apporter votre consentement</h1> */}
          <div className="mb-[24px] text-[14px] leading-[20px] text-[#666666]">
            <p>
              En tant que représentant(e) légal(e), utilisez ce bouton pour vous identifier avec FranceConnect et <b>vérifier votre identité et vos données personnelles</b> (nom,
              prénom, adresse email), ou complétez les informations <b>manuellement</b> ci-dessous.
            </p>
          </div>

          <div>
            {isParentFromFranceConnect ? (
              <div className="mx-auto mb-[32px] w-[400px] text-[14px] leading-[20px] text-[#666666]">
                Les information en provenance de FranceConnect du représentant légal ont bien été enregistrées.
              </div>
            ) : (
              <FranceConnectButton callback={franceConnectCallbackUrl} className="flex-column" />
            )}
          </div>

          <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[16px]">
            <Input value={data.firstName} label="Prénom" onChange={(e) => setData({ ...data, firstName: e })} error={errors.firstName} />
            <Input value={data.lastName} label="Nom" onChange={(e) => setData({ ...data, lastName: e })} error={errors.lastName} />
            <Input value={data.email} label="Adresse email" onChange={(e) => setData({ ...data, email: e })} error={errors.email} type="email" />
            <PhoneField
              label="Votre téléphone"
              onChange={(e) => setData({ ...data, phone: e })}
              onChangeZone={(e) => setData({ ...data, phoneZone: e })}
              value={data.phone}
              zoneValue={data.phoneZone}
              placeholder={PHONE_ZONES[data.phoneZone]?.example}
              error={errors.phone || errors.phoneZone}
            />
          </div>

          <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] py-[20px]">
            <div className="flex items-center">
              <div className="flex-grow-1">
                <b>Je réside</b> {formattedAddress}
              </div>
              <Toggle onClick={toggleConfirmAddress} toggled={data.confirmAddress} />
              {errors.confirmAddress ? <span className="text-sm text-red-500">{errors.confirmAddress}</span> : null}
            </div>
            {!data.confirmAddress && (
              <>
                <ResponsiveRadioButton label="Je réside..." options={livesInFranceOption} onChange={(e) => setData({ ...data, livesInFrance: e })} value={data.livesInFrance} />
                {data.livesInFrance === FRANCE ? (
                  <AddressForm data={data} updateData={(newData) => setData({ ...data, ...newData })} error={errors.address} />
                ) : (
                  <>
                    <Input className="" value={data.address} label="Adresse de résidence" onChange={(e) => setData({ ...data, address: e })} error={errors.address} />
                    <Input
                      className=""
                      value={data.addressComplement}
                      label="Complément d'adresse"
                      onChange={(e) => setData({ ...data, addressComplement: e })}
                      error={errors.addressComplement}
                    />
                    <Input value={data.zip} label="Code postal" onChange={(e) => setData({ ...data, zip: e })} error={errors.zip} />
                    <Input value={data.city} label="Ville" onChange={(e) => setData({ ...data, city: e })} error={errors.city} />
                    <Input className="" value={data.country} label="Pays de résidence" onChange={(e) => setData({ ...data, country: e })} error={errors.country} />
                  </>
                )}
              </>
            )}
          </div>

          {parentId === 1 && (
            <div className="border-t-solid  border-t-[1px] border-t-[#E5E5E5] py-[16px]">
              <AuthorizeBlock className="mb-[32px]" title="Participation au SNU" value={data.allowSNU} onChange={(e) => setData({ ...data, allowSNU: e })} error={errors.allowSNU}>
                <b>{youngFullname}</b> à s&apos;engager comme volontaire du Service National Universel et à participer à une session <b>{cohortYear}</b> du SNU.
              </AuthorizeBlock>

              {data.allowSNU && (
                <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[24px]">
                  <div>
                    <p>
                      Je, <b>{data.firstName + " " + data.lastName}</b>
                    </p>
                    <Check checked={data.rightOlder} onChange={(e) => setData({ ...data, rightOlder: e })} className="mt-[32px]" error={errors.rightOlder}>
                      Confirme être titulaire de l&apos;autorité parentale/représentant(e) légal(e) de&nbsp;<b>{youngFullname}</b>.
                    </Check>
                    <Check checked={data.healthForm} onChange={(e) => setData({ ...data, healthForm: e })} className="mt-[24px]" error={errors.healthForm}>
                      <div className="block">
                        M&apos;engage à communiquer la fiche sanitaire de&nbsp;<b>{youngFullname}</b> au responsable du séjour de cohésion (
                        <a href={CDN_BASE_URL + "/file/fiche-sanitaire-2024.pdf"} target="blank" className="" onClick={(e) => e.stopPropagation()}>
                          Télécharger la fiche sanitaire ici
                        </a>
                        ).
                      </div>
                    </Check>
                    <Check checked={data.vaccination} onChange={(e) => setData({ ...data, vaccination: e })} className="mt-[24px]" error={errors.vaccination}>
                      <div className="block">
                        M&apos;engage à ce que&nbsp;<b>{youngFullname}</b>, à la date du séjour de cohésion, ait satisfait aux obligations vaccinales en vigueur.
                      </div>
                    </Check>
                    <Check checked={data.internalRules} onChange={(e) => setData({ ...data, internalRules: e })} className="mt-[24px]" error={errors.internalRules}>
                      <div className="block">
                        Reconnais avoir pris connaissance du&nbsp;
                        <a href={CDN_BASE_URL + "/file/SNU-reglement-interieur-2024.pdf"} target="blank" className="" onClick={(e) => e.stopPropagation()}>
                          Règlement Intérieur du séjour de cohésion
                        </a>
                        .
                      </div>
                    </Check>
                    <Check checked={data.personalData} onChange={(e) => setData({ ...data, personalData: e })} className="mt-[24px]" error={errors.personalData}>
                      <div className="block">
                        Accepte la collecte et le traitement des données personnelles de&nbsp;<b>{youngFullname}</b> dans le cadre d’une mission d’intérêt public.
                      </div>
                    </Check>
                  </div>
                </div>
              )}
            </div>
          )}
          {(data.allowSNU || parentId === 2) && (
            <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px] mb-8">
              <AuthorizeBlock title="Droit à l’image" value={data.allowImageRights} onChange={(e) => setData({ ...data, allowImageRights: e })} error={errors.allowImageRights}>
                <div className="mb-3">
                  Le Ministère de l’Education Nationale et de la Jeunesse (MENJ), ses services déconcentrés, ses partenaires et les journalistes dûment accrédités par les services
                  de communication du ministère à enregistrer, reproduire et représenter l’image ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou
                  séparément, sur leurs publications respectives.{" "}
                  {!imageRightsExplanationShown && (
                    <a className="whitespace-nowrap" href="#" onClick={toggleImageRightsExplanationShown}>
                      Lire plus
                    </a>
                  )}
                </div>
                {imageRightsExplanationShown && (
                  <>
                    <div className="mb-3">
                      <p>
                        Cette autorisation est valable pour une utilisation sur l’ensemble du parcours du service national universel, tant durant le séjour de cohésion que dans le
                        cadre de la mobilisation du volontaire au titre de la réserve du SNU :{" "}
                      </p>
                      <div className="ml-4 mt-2 mb-2">
                        <li>pour une durée de 5 ans à compter de la signature de la présente ;</li>
                        <li> sur tous les supports d’information et de communication imprimés ou numériques à but non lucratif ; </li>
                        <li>édités par les services de l’État ainsi que sur tous réseaux de communication, y compris télévisuels ou Internet ;</li>
                        <li>de l’image du volontaire représenté en tant que telle ou intégrée dans une œuvre papier, numérique ou audiovisuelle.</li>
                      </div>
                      <p>
                        Conformément aux dispositions légales en vigueur relatives au droit à l’image, le MENJ s’engage à ce que la publication et la diffusion de l’image du
                        volontaire ainsi que des commentaires l’accompagnant ne portent pas atteinte à sa vie privée, à sa dignité et à sa réputation. En vertu du Règlement général
                        sur la protection des données (RGPD), entré en application le 25 mai 2018, le volontaire et ses représentants légaux disposent d’un libre accès aux photos
                        concernant la personne mineure et ont le droit de demander à tout moment le retrait de celles-ci. La présente autorisation est consentie à titre gratuit.
                      </p>
                    </div>
                    <div className="mb-3">La présente autorisation est consentie à titre gratuit.</div>
                    <a className="underline" href="#" onClick={toggleImageRightsExplanationShown}>
                      Lire moins
                    </a>
                  </>
                )}
              </AuthorizeBlock>
            </div>
          )}
          {errors.global && <ErrorMessage className="mb-[32px]">{errors.global}</ErrorMessage>}
        </div>
        <SignupButtons onClickNext={onSubmit} labelNext="Je valide" onClickPrevious={onPrevious} disabled={saving} />
      </DSFRContainer>
    </>
  );
}
