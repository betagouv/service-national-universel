import React, { useContext, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Loader from "../../../components/Loader";
import FranceConnectButton from "../../inscription2023/components/FranceConnectButton";
import Input from "../../inscription2023/components/Input";
import ResponsiveRadioButton from "../../../components/dsfr/ui/buttons/RadioButton";
// TODO: mettre le Toggle dans les components génériques
import Toggle from "../../../components/dsfr/forms/toggle";
import { PHONE_ZONES, isPhoneNumberWellFormated, translate } from "snu-lib";
import { FRANCE, ABROAD, translateError, stringToBoolean, isReturningParentForImageRights, API_CONSENT_IMAGE_RIGHTS } from "../commons";
import AddressForm from "@/components/dsfr/forms/AddressForm";
import validator from "validator";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import api from "../../../services/api";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import PhoneField from "@/components/dsfr/forms/PhoneField";
import AuthorizeBlock from "../components/AuthorizeBlock";
import { getAddress } from "../utils";
import { SignupButtons } from "@snu/ds/dsfr";

export default function ImageRights({ parentId }) {
  const { young, token } = useContext(RepresentantsLegauxContext);
  if (!young) return <Loader />;
  // Only render component after young is loaded => avoid buggy state
  return ImageRightsForm({ young, token, parentId });
}

function ImageRightsForm({ young, token, parentId }) {
  const history = useHistory();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = React.useState(false);
  const address = getInitialAdress(young, parentId);
  const [data, setData] = useState({
    firstName: young[`parent${parentId}FirstName`] ? young[`parent${parentId}FirstName`] : "",
    lastName: young[`parent${parentId}LastName`] ? young[`parent${parentId}LastName`] : "",
    email: young[`parent${parentId}Email`] ? young[`parent${parentId}Email`] : "",
    phone: young[`parent${parentId}Phone`] ? young[`parent${parentId}Phone`] : "",
    phoneZone: young[`parent${parentId}PhoneZone`] ? young[`parent${parentId}PhoneZone`] : "",
    confirmAddress: !validator.isEmpty(address.address, { ignore_whitespace: true }) && !validator.isEmpty(address.city, { ignore_whitespace: true }),
    addressType: address.country && address.country !== FRANCE ? ABROAD : FRANCE,
    addressVerified: young.addressParent1Verified === "true",
    ...address,
    allowImageRights: stringToBoolean(young[`parent${parentId}AllowImageRights`]),
  });

  const [imageRightsExplanationShown, setImageRightsExplanationShown] = useState(false);

  function getInitialAdress(young, parentId) {
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
    return address;
  }

  if (isReturningParentForImageRights(young, parentId)) {
    const route = parentId === 2 ? "droits-image-done-parent2" : "droits-image-done";
    return <Redirect to={`/representants-legaux/${route}?token=${token}`} />;
  }

  // --- France Connect
  const isParentFromFranceConnect = young[`parent${parentId}FromFranceConnect`] === "true";
  const franceConnectCallbackUrl = "representants-legaux/france-connect-callback?parent=" + parentId + "&token=" + token;

  // --- address
  const formattedAddress =
    young?.address + (young?.addressComplement ? " " + young?.addressComplement : "") + " " + young?.zip + " " + young?.city + (young?.country ? ", " + young?.country : "");

  const addressTypeOptions = [
    { label: "En France (Métropolitaine ou Outre-mer)", value: FRANCE },
    { label: "À l’étranger", value: ABROAD },
  ];
  console.log("🚀 ~ ImageRightsForm ~ data:", data);

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
    console.log("🚀 ~ onSubmit ~ errors:", errors);
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

    const trimmedPhone = data.phone?.replace(/\s/g, "");

    if (data.phone && !isPhoneNumberWellFormated(trimmedPhone, data.phoneZone)) {
      errors.phone = PHONE_ZONES[data.phoneZone]?.errorMessage;
    }

    // --- address
    let validAddress = validate("address", "empty", validator.isEmpty(data.address, { ignore_whitespace: true }));
    validAddress = validate("city", "empty", validator.isEmpty(data.city, { ignore_whitespace: true })) && validAddress;
    validAddress = validate("zip", "empty", validator.isEmpty(data.zip, { ignore_whitespace: true }));

    if (data.addressType === ABROAD && data.country.toLowerCase() === "france") {
      errors.country = "Le pays ne peut pas être France si vous résidez à l'étranger";
      validAddress = false;
    }
    if (data.addressType === ABROAD) {
      console.log("ABROAD");
      validAddress = validate("country", "empty", validator.isEmpty(data.country, { ignore_whitespace: true }));
    } else {
      console.log("FRANCE");
      validAddress = validate("zip", "invalid", !validator.isPostalCode(data.zip, "FR")) && validAddress;
    }

    if (!validAddress) {
      setData({ ...data, confirmAddress: false });
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
    console.log("🚀 ~ saveData ~ ownAddress:", ownAddress);
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
      <DSFRContainer title="Modifier votre accord de droit à l'image">
        <div className="flex flex-col">
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
            <Input value={data.email} label="Adresse email" onChange={(e) => setData({ ...data, email: e })} error={errors.email} />
            <PhoneField
              value={data.phone}
              label="Votre téléphone"
              onChange={(e) => setData({ ...data, phone: e })}
              zoneValue={data.phoneZone}
              onChangeZone={(e) => setData({ ...data, phoneZone: e })}
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
                <ResponsiveRadioButton label="Je réside..." options={addressTypeOptions} onChange={(e) => setData({ ...data, addressType: e })} value={data.addressType} />
                {data.addressType === FRANCE ? (
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

          {errors.global && <ErrorMessage className="mb-[32px]">{errors.global}</ErrorMessage>}
        </div>
        <SignupButtons onClickNext={onSubmit} labelNext="Valider" disabled={saving} />
      </DSFRContainer>
    </>
  );
}
