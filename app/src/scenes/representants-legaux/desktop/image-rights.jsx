import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import FranceConnectButton from "../../inscription2023/components/FranceConnectButton";
import Input from "../../inscription2023/components/Input";
// TODO: mettre le Toggle dans les components génériques
import Toggle from "../../../components/dsfr/forms/toggle";
import { translate } from "snu-lib";
import RadioButton from "../components/RadioButton";
import { FRANCE, ABROAD, translateError, stringToBoolean, isReturningParentForImageRights, API_CONSENT_IMAGE_RIGHTS } from "../commons";
import VerifyAddress from "../../inscription2023/components/VerifyAddress";
import validator from "validator";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import api from "../../../services/api";
import { PlainButton } from "../components/Buttons";
import { regexPhoneFrenchCountries } from "../../../utils";
import AuthorizeBlock from "../components/AuthorizeBlock";

export default function ImageRights({ parentId }) {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = React.useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    confirmAddress: false,
    addressType: FRANCE,
    addressVerified: false,
    address: "",
    addressComplement: "",
    zip: "",
    city: "",
    country: "",
    cityCode: null,
    region: null,
    department: null,
    location: null,
    allowImageRights: null,
  });
  const [imageRightsExplanationShown, setImageRightsExplanationShown] = useState(false);

  useEffect(() => {
    if (young) {
      if (isReturningParentForImageRights(young, parentId)) {
        return done();
      }

      let address;
      if (young[`parent${parentId}OwnAddress`] === "true") {
        address = {
          address: young[`parent${parentId}Address`] ? young[`parent${parentId}Address`] : "",
          addressComplement: young[`parent${parentId}ComplementAddress`] ? young[`parent${parentId}ComplementAddress`] : "",
          zip: young[`parent${parentId}Zip`] ? young[`parent${parentId}Zip`] : "",
          city: young[`parent${parentId}City`] ? young[`parent${parentId}City`] : "",
          country: young[`parent${parentId}Country`] ? young[`parent${parentId}Country`] : "",
          cityCode: young[`parent${parentId}CityCode`] ? young[`parent${parentId}CityCode`] : "",
          department: young[`parent${parentId}Department`] ? young[`parent${parentId}Department`] : null,
          region: young[`parent${parentId}Region`] ? young[`parent${parentId}Region`] : null,
          location: young[`parent${parentId}Location`] ? young[`parent${parentId}Location`] : null,
        };
      } else {
        address = {
          address: young.address ? young.address : "",
          addressComplement: young.complementAddress ? young.complementAddress : "",
          zip: young.zip ? young.zip : "",
          city: young.city ? young.city : "",
          country: young.country ? young.country : "",
          cityCode: young.cityCode ? young.cityCode : "",
          department: young.department ? young.department : null,
          region: young.region ? young.region : null,
          location: young.location ? young.location : null,
        };
      }

      const confirmAddress = !validator.isEmpty(address.address, { ignore_whitespace: true }) && !validator.isEmpty(address.city, { ignore_whitespace: true });

      setData({
        firstName: young[`parent${parentId}FirstName`] ? young[`parent${parentId}FirstName`] : "",
        lastName: young[`parent${parentId}LastName`] ? young[`parent${parentId}LastName`] : "",
        email: young[`parent${parentId}Email`] ? young[`parent${parentId}Email`] : "",
        phone: young[`parent${parentId}Phone`] ? young[`parent${parentId}Phone`] : "",
        confirmAddress,
        addressType: address.country && address.country !== FRANCE ? ABROAD : FRANCE,
        addressVerified: young.addressParent1Verified === "true",
        ...address,
        allowImageRights: stringToBoolean(young[`parent${parentId}AllowImageRights`]),
      });
    }
  }, [young]);

  if (!young) return <Loader />;

  // --- France Connect
  const isParentFromFranceConnect = young[`parent${parentId}FromFranceConnect`] === "true";
  const franceConnectCallbackUrl = "representants-legaux/france-connect-callback?parent=" + parentId + "&token=" + token;

  // --- address
  const formattedAddress =
    data.address + (data.addressComplement ? " " + data.addressComplement : "") + " " + data.zip + " " + data.city + (data.country ? ", " + data.country : "");

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

  // --- ui
  function toggleImageRightsExplanationShown(e) {
    e.preventDefault();
    setImageRightsExplanationShown(!imageRightsExplanationShown);
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
    if (validate("phone", "empty", validator.isEmpty(data.phone, { ignore_whitespace: true }))) {
      validate("phone", "invalid", !validator.matches(data.phone, regexPhoneFrenchCountries));
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
    validate("allowImageRights", "not_choosen", data.allowImageRights !== false && data.allowImageRights !== true);

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
      [`parent${parentId}Email`]: validator.normalizeEmail(data.email),
      [`parent${parentId}Phone`]: data.phone.trim(),
      ...address,
      [`parent${parentId}AllowImageRights`]: data.allowImageRights ? "true" : "false",
    };

    // if (young.status === "REINSCRIPTION") plausibleEvent("Phase0/CTA representant legal - Consentement valide - reinscription");
    // else plausibleEvent("Phase0/CTA representant legal - Consentement valide");

    try {
      const { code, ok } = await api.post(API_CONSENT_IMAGE_RIGHTS + `?token=${token}&parent=${parentId}`, body);
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
    history.push(`/representants-legaux/droits-image-done${parentId.toString() === "2" ? "2" : ""}?token=${token}&parent=${parentId}`);
  }

  return (
    <>
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
          <h1 className="leading-40 mb-2 text-[24px] font-bold leading-[32px] text-[#21213F]">Modifier votre accord de droit à l&apos;image</h1>

          <div className="mb-[32px] mt-2 text-[14px] leading-[20px] text-[#666666]">
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

          <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px]">
            <div className="flex">
              <Input className="mr-2 flex-[1_0_0]" value={data.firstName} label="Prénom" onChange={(e) => setData({ ...data, firstName: e })} error={errors.firstName} />
              <Input className="ml-2 flex-[1_0_0]" value={data.lastName} label="Nom" onChange={(e) => setData({ ...data, lastName: e })} error={errors.lastName} />
            </div>
            <Input className="" value={data.email} label="Adresse email" onChange={(e) => setData({ ...data, email: e })} error={errors.email} />
            <Input className="" value={data.phone} label="Votre téléphone" onChange={(e) => setData({ ...data, phone: e })} error={errors.phone} />
          </div>

          <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] py-[32px]">
            <div className="flex items-center">
              <div className="flex-grow-1">
                <b>Je réside</b> {formattedAddress}
              </div>

              <Toggle onClick={() => setData({ ...data, confirmAddress: !data.confirmAddress })} toggled={data.confirmAddress} />
              {errors.confirmAddress ? <span className="text-sm text-red-500">{errors.confirmAddress}</span> : null}
            </div>
            {!data.confirmAddress && (
              <>
                <RadioButton label="Je réside..." options={addressTypeOptions} onChange={(e) => setData({ ...data, addressType: e })} value={data.addressType} />
                <Input className="" value={data.address} label="Adresse de résidence" onChange={(e) => setData({ ...data, address: e })} error={errors.address} />
                <Input
                  className=""
                  value={data.addressComplement}
                  label="Complément d'adresse"
                  onChange={(e) => setData({ ...data, addressComplement: e })}
                  error={errors.addressComplement}
                />
                <div className="flex">
                  <Input className="mr-2 flex-[1_0_0]" value={data.zip} label="Code postal" onChange={(e) => setData({ ...data, zip: e })} error={errors.zip} />
                  <Input className="ml-2 flex-[1_0_0]" value={data.city} label="Ville" onChange={(e) => setData({ ...data, city: e })} error={errors.city} />
                </div>
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

          <div className="border-t-solid border-t-[1px] border-t-[#E5E5E5] pt-[32px]">
            <AuthorizeBlock title="Droit à l’image" value={data.allowImageRights} onChange={(e) => setData({ ...data, allowImageRights: e })} error={errors.allowImageRights}>
              <div className="mb-3">
                Le Ministère de l’Education Nationale et de la Jeunesse, ses partenaires et les journalistes dûment accrédités par les services communication du ministère et/ou des
                préfectures à enregistrer, reproduire et représenter l’image et/ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou séparément, sur leurs
                publications respectives.{" "}
                {!imageRightsExplanationShown && (
                  <a className="whitespace-nowrap underline" href="#" onClick={toggleImageRightsExplanationShown}>
                    Lire plus
                  </a>
                )}
              </div>
              {imageRightsExplanationShown && (
                <>
                  <div className="mb-3">
                    Cette autorisation est valable pour une utilisation : d’une durée de 5 ans à compter de la signature de la présente ; sur tous les supports d’information et de
                    communication imprimés ou numériques à but non lucratif ; édités par les services de l’État ainsi que sur tous réseaux de communication, y compris télévisuels
                    ou Internet ; de l’image du volontaire représenté en tant que telle et/ou intégrée dans une œuvre papier, numérique ou audiovisuelle. Conformément aux
                    dispositions légales en vigueur relatives au droit à l’image, le MENJS s’engage à ce que la publication et la diffusion de l’image ainsi que des commentaires
                    l’accompagnant ne portent pas atteinte à sa vie privée, à sa dignité et à sa réputation. En vertu du Règlement général sur la protection des données (RGPD),
                    entré en application le 25 mai 2018, le sujet ou son/ses représentant(s) légal/légaux dispose(ent) d’un libre accès aux photos concernant la personne mineure et
                    a le droit de demander à tout moment le retrait de celles-ci*.
                  </div>
                  <div className="mb-3">La présente autorisation est consentie à titre gratuit.</div>
                  <a className="underline" href="#" onClick={toggleImageRightsExplanationShown}>
                    Lire moins
                  </a>
                </>
              )}
            </AuthorizeBlock>
          </div>

          <div className="border-t-solid mt-[32px] border-t-[1px] border-t-[#E5E5E5] pt-[32px]">
            {errors.global && <ErrorMessage className="mb-[32px]">{errors.global}</ErrorMessage>}
            <div className="flex justify-end ">
              <PlainButton onClick={onSubmit} spinner={saving}>
                Valider
              </PlainButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
