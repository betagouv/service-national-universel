import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import Navbar from "../components/Navbar";
import FranceConnectButton from "../../inscription2023/components/FranceConnectButton";
import Input from "../../inscription2023/components/Input";
import ResponsiveRadioButton from "../../inscription2023/components/RadioButton";
// TODO: mettre le Toggle dans les components génériques
import Toggle from "../../../components/inscription/toggle";
import { COHESION_STAY_LIMIT_DATE, getAge, translate } from "snu-lib";
import Check from "../components/Check";
import { FRANCE, ABROAD, translateError, API_CONSENT, isReturningParent, CDN_BASE_URL } from "../commons";
import VerifyAddress from "../../inscription2023/components/VerifyAddress";
import validator from "validator";
import ErrorMessage from "../../inscription2023/components/ErrorMessage";
import api from "../../../services/api";
import Footer from "@/components/dsfr/components/Footer";
import StickyButton from "../../../components/inscription/stickyButton";
import plausibleEvent from "../../../services/plausible";
import AuthorizeBlock from "../components/AuthorizeBlock";
import { getDataForConsentStep } from "../utils";
import PhoneField from "../../inscription2023/components/PhoneField";
import { PHONE_ZONES, isPhoneNumberWellFormated } from "snu-lib/phone-number";

export default function Consentement({ step, parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  if (!young) return <Loader />;

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = React.useState(false);
  const [imageRightsExplanationShown, setImageRightsExplanationShown] = useState(false);
  const [data, setData] = useState(getDataForConsentStep(young, parentId));

  if (isReturningParent(young, parentId)) return done();

  // --- young
  const youngFullname = young.firstName + " " + young.lastName;
  const youngAge = getAge(young.birthDate);
  const sessionDate = COHESION_STAY_LIMIT_DATE[young.cohort];

  // --- France Connect
  const isParentFromFranceConnect = young[`parent${parentId}FromFranceConnect`] === "true";
  const franceConnectCallbackUrl = "representants-legaux/france-connect-callback?parent=" + parentId + "&token=" + token;

  // --- address
  const formattedAddress =
    data?.address && data.address + (data.addressComplement ? " " + data.addressComplement : "") + " " + data.zip + " " + data.city + (data.country ? ", " + data.country : "");

  const addressTypeOptions = [
    { label: "En France (Métropolitaine ou Outre-mer)", value: FRANCE },
    { label: "À l’étranger", value: ABROAD },
  ];

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
    setErrors({ addressVerified: undefined });
  };

  function toggleImageRightsExplanationShown(e) {
    e.preventDefault();
    setImageRightsExplanationShown(!imageRightsExplanationShown);
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
    if (!data.addressVerified) {
      let validAddress = validate("address", "empty", validator.isEmpty(data.address, { ignore_whitespace: true }));
      if (validate("zip", "empty", validator.isEmpty(data.zip, { ignore_whitespace: true }))) {
        validAddress = validate("zip", "invalid", !validator.isPostalCode(data.zip, "FR")) && validAddress;
      }
      validAddress = validate("city", "empty", validator.isEmpty(data.city, { ignore_whitespace: true })) && validAddress;

      if (data.addressType === ABROAD) {
        validAddress = validate("country", "empty", validator.isEmpty(data.country, { ignore_whitespace: true })) && validAddress;
      }

      if (!validAddress) {
        setData({ ...data, confirmAddress: false });
      }
    }

    // --- accept
    if (parentId === 1) {
      validate("allowSNU", "not_choosen", data.allowSNU !== false && data.allowSNU !== true);

      if (data.allowSNU) {
        validate("rightOlder", "unchecked", data.rightOlder !== true);
        if (youngAge < 15) {
          validate("personalData", "unchecked", data.personalData !== true);
        }
        validate("healthForm", "unchecked", data.healthForm !== true);
        validate("vaccination", "unchecked", data.vaccination !== true);
        validate("internalRules", "unchecked", data.internalRules !== true);

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

  return (
    <>
      <Navbar step={step} />
      <div className="bg-white px-3 py-4 text-[#161616]">
        <div className="flex flex-col">
          <h1 className="mb-1  text-[22px] font-bold text-[#21213F]">Apporter votre consentement</h1>
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
              <Toggle onClick={() => setData({ ...data, confirmAddress: !data.confirmAddress })} toggled={data.confirmAddress} />
              {errors.confirmAddress ? <span className="text-sm text-red-500">{errors.confirmAddress}</span> : null}
            </div>
            {!data.confirmAddress && (
              <>
                <ResponsiveRadioButton label="Je réside..." options={addressTypeOptions} onChange={(e) => setData({ ...data, addressType: e })} value={data.addressType} />
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
                {data.addressType === ABROAD ? (
                  <Input className="" value={data.country} label="Pays de résidence" onChange={(e) => setData({ ...data, country: e })} error={errors.country} />
                ) : (
                  <div className="flex justify-end">
                    <div className="w-[50%]">
                      <VerifyAddress
                        address={data.address}
                        zip={data.zip}
                        city={data.city}
                        onSuccess={onVerifyAddress(true)}
                        onFail={onVerifyAddress()}
                        isVerified={data.addressVerified === true}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {parentId === 1 && (
            <div className="border-t-solid  border-t-[1px] border-t-[#E5E5E5] py-[16px]">
              <AuthorizeBlock className="mb-[32px]" title="Participation au SNU" value={data.allowSNU} onChange={(e) => setData({ ...data, allowSNU: e })} error={errors.allowSNU}>
                <b>{youngFullname}</b> à participer à la session <b>{sessionDate}</b> du Service National Universel qui comprend la participation à un séjour de cohésion et la
                réalisation d&apos;une mission d&apos;intérêt général.
              </AuthorizeBlock>

              {data.allowSNU && (
                <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[24px]">
                  <div>
                    Je, <b>{data.firstName + " " + data.lastName}</b>
                    <Check checked={data.rightOlder} onChange={(e) => setData({ ...data, rightOlder: e })} className="mt-[32px]" error={errors.rightOlder}>
                      Confirme être titulaire de l&apos;autorité parentale/ représentant(e) légal(e) de <b>{youngFullname}</b>
                    </Check>
                    {youngAge < 15 && (
                      <Check checked={data.personalData} onChange={(e) => setData({ ...data, personalData: e })} className="mt-[24px]" error={errors.personalData}>
                        J&apos;accepte la collecte et le traitement des données personnelles de <b>{youngFullname}</b>
                      </Check>
                    )}
                    <Check checked={data.healthForm} onChange={(e) => setData({ ...data, healthForm: e })} className="mt-[24px]" error={errors.healthForm}>
                      M’engage à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires avant son départ en séjour de
                      cohésion (
                      <a href={CDN_BASE_URL + "/file/fiche-sanitaire-2023.pdf"} target="blank" className="underline" onClick={(e) => e.stopPropagation()}>
                        Télécharger la fiche sanitaire ici
                      </a>
                      ).
                    </Check>
                    <Check checked={data.vaccination} onChange={(e) => setData({ ...data, vaccination: e })} className="mt-[24px]" error={errors.vaccination}>
                      M&apos;engage à ce que <b>{youngFullname}</b> soit à jour de ses vaccinations obligatoires, c&apos;est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP),
                      et pour les volontaires résidents de Guyane, la fièvre jaune.
                    </Check>
                    <Check checked={data.internalRules} onChange={(e) => setData({ ...data, internalRules: e })} className="mt-[24px]" error={errors.internalRules}>
                      Reconnais avoir pris connaissance du{" "}
                      <a href={CDN_BASE_URL + "/file/snu-reglement-interieur-2022-2023.pdf"} target="blank" className="underline" onClick={(e) => e.stopPropagation()}>
                        Règlement Intérieur du SNU
                      </a>
                      .
                    </Check>
                  </div>
                </div>
              )}
            </div>
          )}
          {(data.allowSNU || parentId === 2) && (
            <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px]">
              {/*<AuthorizeBlock
                title="Utilisation d’autotests COVID"
                value={data.allowCovidAutotest}
                onChange={(e) => setData({ ...data, allowCovidAutotest: e })}
                error={errors.allowCovidAutotest}>
                <div className="mb-3">
                  La réalisation d’autotests antigéniques sur prélèvement nasal par l’enfant dont je suis titulaire de l’autorité parentale, et, en cas de résultat positif, la
                  communication communication communication de celui-ci au directeur académiques des services académiques, à l’ARS, au chef de centre et aux personnes habilitées par
                  ce dernier.{" "}
                  {!covidAutoTestExplanationShown && (
                    <a className="underline whitespace-nowrap" href="#" onClick={toggleCovidAutoTestExplanationShown}>
                      Lire plus
                    </a>
                  )}
                </div>
                {covidAutoTestExplanationShown && (
                  <>
                    <div className="mb-3">
                      Vous avez souhaité que votre enfant participe au séjour de cohésion du SNU. L’épidémie actuelle de COVID-19 nécessite de prendre des mesures de prévention et de
                      santé publique pour :
                      <ul className="list-disc ml-4">
                        <li>Garantir la sécurité de tous, volontaires et cadres</li>
                        <li>Permettre à chacun de participer à la totalité du séjour et éviter un éventuel retour à domicile ou un isolement en cas de contamination.</li>
                      </ul>
                    </div>
                    <div className="mb-3">
                      En complément du test PCR, antigénique ou autotest recommandé avant le départ en séjour, des autotests antigéniques sur prélèvement nasal pourront être réalisés
                      durant le séjour en présence de signes évocateurs de la covid-19, de cas confirmés ou de cas contacts.
                    </div>
                    <h3>Protocole sanitaire de l’année 2022-2023</h3>
                    <div className="mb-3">
                      Durant le séjour de cohésion, des séances permettant la réalisation d’autotests pourraient être organisées en cas de nécessité, sous l’encadrement d’un
                      infirmier ou d’un cadre formé à la réalisation du prélèvement. Ces tests permettant de vivre en collectivité dans des conditions de sécurité sont fortement
                      recommandés mais non obligatoires. S’ils sont pratiqués, seuls seront concernés les volontaires ayant remis lors de leur inscription le consentement écrit
                      représentant légal.
                    </div>
                    <div className="mb-3">
                      Votre consentement est également requis pour que les résultats des autotests puissent être transmis au chef de centre et aux personnes habilitées par ce
                      dernier, au directeur académique des services de l’éducation et à l’ARS en cas de résultat positif. Le consentement à la réalisation des autotests et à la
                      transmission des données est recueilli par le biais du formulaire que vous trouverez ci-joint et qui est à téléverser depuis le compte volontaire.
                    </div>
                    <a className="underline" href="#" onClick={toggleCovidAutoTestExplanationShown}>
                      Lire moins
                    </a>
                  </>
                )}
              </AuthorizeBlock>*/}
              <AuthorizeBlock title="Droit à l’image" value={data.allowImageRights} onChange={(e) => setData({ ...data, allowImageRights: e })} error={errors.allowImageRights}>
                <div className="mb-3">
                  Le Ministère de l’Education Nationale et de la Jeunesse, ses partenaires et les journalistes dûment accrédités par les services communication du ministère et/ou
                  des préfectures à enregistrer, reproduire et représenter l’image et/ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou séparément, sur
                  leurs publications respectives.{" "}
                  {!imageRightsExplanationShown && (
                    <a className="whitespace-nowrap underline" href="#" onClick={toggleImageRightsExplanationShown}>
                      Lire plus
                    </a>
                  )}
                </div>
                {imageRightsExplanationShown && (
                  <>
                    <div className="mb-3">
                      Cette autorisation est valable pour une utilisation : d’une durée de 5 ans à compter de la signature de la présente ; sur tous les supports d’information et
                      de communication imprimés ou numériques à but non lucratif ; édités par les services de l’État ainsi que sur tous réseaux de communication, y compris
                      télévisuels ou Internet ; de l’image du volontaire représenté en tant que telle et/ou intégrée dans une œuvre papier, numérique ou audiovisuelle. Conformément
                      aux dispositions légales en vigueur relatives au droit à l’image, le MENJS s’engage à ce que la publication et la diffusion de l’image ainsi que des
                      commentaires l’accompagnant ne portent pas atteinte à sa vie privée, à sa dignité et à sa réputation. En vertu du Règlement général sur la protection des
                      données (RGPD), entré en application le 25 mai 2018, le sujet ou son/ses représentant(s) légal/légaux dispose(ent) d’un libre accès aux photos concernant la
                      personne mineure et a le droit de demander à tout moment le retrait de celles-ci*.
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
      </div>
      <Footer marginBottom="mb-[88px]" />
      <StickyButton onClickPrevious={onPrevious} onClick={onSubmit} disabled={saving} text="Je valide" />
    </>
  );
}
