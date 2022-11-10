import React from "react";
import styled from "styled-components";
import { Formik, Field as FieldFormik } from "formik";
import validator from "validator";
import "dayjs/locale/fr";

import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import SituationsParticulieres from "./edit/situations-particulieres";
import Consentement from "./edit/consentement";
import ConsentementImage from "./edit/consentement-image";
import ChevronDown from "../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";

import { START_DATE_SESSION_PHASE1, translateGrade, YOUNG_SITUATIONS, GRADES } from "snu-lib";
import { youngEmployedSituationOptions, youngSchooledSituationOptions } from "../phase0/commons";



//Identite
import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import Field from "./components/Field";
import Documents from "./components/Documents";
import DndFileInput from "../../components/dndFileInputV2";
import { CniField } from "../phase0/components/CniField";
import SchoolEditor from "../phase0/components/SchoolEditor";
import VerifyAddress from "../phase0/components/VerifyAddress";
import FieldSituationsParticulieres from "../phase0/components/FieldSituationsParticulieres";



export default function Create() {
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [selectedRepresentant, setSelectedRepresentant] = React.useState(1);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const validate = (values, props /* only available when using withFormik */) => {
    const errors = {};
    const errorEmpty = "Ne peut être vide";
    console.log(values);
    const required = ["firstName", "lastName", "birthdateAt", "birthCityZip", "birthCity", "gender", "birthCountry", "phone", "cohort", "parentStatementOfHonorInvalidId", "parent1Status", "parent1LastName", "parent1FirstName", "parent1Email", "situation", "address", "city", "zip"]
    if (!values.email) {
      errors.email = errorEmpty;

    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Adresse email invalide';

    }
    for (const key of required) {
      console.log(key)
      if ((!values[key] || validator.isEmpty(values[key], { ignore_whitespace: true }) || values[key] === null)) {
        errors[key] = errorEmpty;
      }
    }
    if (values.country === "FRANCE") {
      if (values.schoolCity === "") {
        errors.schoolCity = errorEmpty;
      }
    }
    if (values.specificAmenagment === "true" && values.specificAmenagmentType === "") {
      errors.specificAmenagmentType = errorEmpty;
    }
    // permet de vérifier si l'adresse a été entièrement remplie mais pas vérifiée
    if (!(errors.address || errors.city || errors.zip)) {
      if (values.department === "" || values.region === "") {
        toastr.error("Une erreur s'est produite : \n Vous devez vérifier l'adresse");
      }
    }

    if (Object.keys(errors).length > 0) {
      toastr.error("Une erreur s'est produite : \n Le formulaire n'est pas complet");
    }
    return errors;
  };

  return (
    <Wrapper>
      <Formik
        initialValues={{
          status: "VALIDATED",
          firstName: "",
          lastName: "",
          birthdateAt: null,
          birthCityZip: "",
          birthCity: "",
          gender: "",
          grade: "",
          birthCountry: "",
          filesToUpload: [],
          latestCNIFileExpirationDate: "",
          latestCNIFileCategory: "",
          files: {
            cniFiles: [],
            highSkilledActivityProofFiles: [],
            parentConsentmentFiles: [],
            imageRightFiles: [],
          },
          email: "",
          expirationDate: null,
          phone: "",
          cohort: Object.keys(START_DATE_SESSION_PHASE1)[0],
          parentStatementOfHonorInvalidId: "false",
          addressVerified: false,
          zip: "",
          city: "",
          region: "",
          department: "",
          address: "",
          situation: "",
          schoolId: "",
          schoolName: "",
          schoolType: "",
          schoolAddress: "",
          schoolZip: "",
          schoolDepartment: "",
          schoolRegion: "",
          schoolCity: "",
          schoolCountry: "FRANCE",
          schooled: "true",
          employed: "false",
          specificAmenagment: "false",
          specificAmenagmentType: "",
          specificSituations: "",
          reducedMobilityAccess: "false",
          handicapInSameDepartment: "false",
          ppsBeneficiary: "false",
          paiBeneficiary: "false",
          allergies: "false",
          parent1Status: "",
          parent1FirstName: "",
          parent1LastName: "",
          parent1Email: "",
          parent1Phone: "",
          parent1OwnAddress: "false",
          parent1Address: "",
          parent1Zip: "",
          parent1City: "",
          parent1Country: "",
          parent2Status: "",
          parent2FirstName: "",
          parent2LastName: "",
          parent2Email: "",
          parent2Phone: "",
          parent2OwnAddress: "false",
          parent2Address: "",
          parent2Zip: "",
          parent2City: "",
          parent2Country: "",
        }}
        validateOnBlur={false}
        validateOnChange={false}
        validate={validate}
        onSubmit={async (values) => {
          try {
            const { ok, code } = await api.post("/young/invite", values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Volontaire créé !");
            return history.push("/inscription");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched, setFieldValue, validateField }) => (
          <>
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[27px]">
              <div className="text-[25px] font-[700] flex items-center justify-center">Créer une inscription manuellement</div>
              <div className="ml-[32px] text-[18px] font-[500]">Informations générales</div>
              <div className={`flex ${false ? "hidden" : "block"}`}>
                <div className="flex-[1_0_50%] pr-[56px]">
                  <Identite
                    values={values}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    touched={touched}
                  />
                </div>
                <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
                <div className="flex-[1_0_50%] pl-[56px]">
                  <Coordonnees
                    values={values}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    validateField={validateField}
                  />
                </div>
              </div>
            </div>
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
              <div className="ml-[32px] text-[18px] font-[500]">Informations générales</div>
              <div className={`flex ${false ? "hidden" : "block"}`}>
                <div className="flex-[1_0_50%] pr-[56px]">
                  <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} touched={touched} />
                </div>
                <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
                <div className="flex-[1_0_50%] pl-[56px]">
                  <Box>
                    <BoxContent direction="column">
                      <div className="ml-[32px] mb-[24px] flex items-start justify-start">
                        <div onClick={() => setSelectedRepresentant(1)} className={`cursor-pointer pb-[18px] ${selectedRepresentant === 1 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-[36px]`}>Représentant légal 1</div>
                        <div onClick={() => setSelectedRepresentant(2)} className={`cursor-pointer pb-[18px] ${selectedRepresentant === 2 && "border-b-4 text-[#3B82F6]"} border-[#3B82F6] mr-[36px]`}>Représentant légal 2</div>
                      </div>
                      {selectedRepresentant === 1 ?
                        <Representant1 values={values} errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
                        :
                        <Representant2 values={values} errors={errors} handleChange={handleChange} setFieldValue={setFieldValue} />
                      }
                    </BoxContent>
                  </Box>
                </div>
              </div>
            </div>

            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
              <div className="ml-[32px] text-[18px] font-[500]">Choisissez un séjour pour le volontaire</div>
              <div className="flex justify-start flex-row flex-wrap pl-[24px]">
                {Object.keys(START_DATE_SESSION_PHASE1).map((key, value) => {
                  return (
                    <div onClick={() => setFieldValue("cohort", key)} className="cursor-pointer flex flex-row justify-start items-center w-[237px] h-[54px] border border-[#3B82F6] rounded-[6px] m-[16px]">
                      <FieldFormik
                        id="checkboxCGU"
                        type="checkbox"
                        value={key === values.cohort}
                        onChange={() => setFieldValue("cohort", key)}
                        name="cohort"
                        checked={key === values.cohort}
                        className="rounded-full ml-[13px] mr-[11px]"
                      />
                      <div>{key}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center w-100 justify-center">
              <div onClick={handleSubmit} className="cursor-pointer w-[365px] bg-[#2563EB] text-white py-[9px] px-[17px] text-center rounded-[6px] self-center">Créer l'inscription</div>
            </div>
          </>
        )}
      </Formik>
    </Wrapper >
  );
}

function Representant2({ values, handleChange, required = {}, errors, touched, setFieldValue }) {
  return (
    <>
      <Field
        name="parent2Status"
        label="Statut"
        errors={errors}
        type="select"
        value={values.parent2Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="parent2LastName"
          label="Nom"
          errors={errors}
          value={values.parent2LastName}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name="parent2FirstName"
          label="Prénom"
          errors={errors}
          value={values.parent2FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field
        name="parent2Email"
        label="Email"
        errors={errors}
        value={values.parent2Email}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <Field
        name="parent2OwnAddress"
        label="Adresse différente de celle du volontaire"
        errors={errors}
        type="select"
        value={values.parent2OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      {values.parent2OwnAddress === "true" &&
        <>
          <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
          <Field
            name="parent2Address"
            label="Adresse"
            errors={errors}
            value={values.parent2Address}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <div className="mb-[16px] flex items-start justify-between mt-[16px]">
            <Field
              name="parent2Zip"
              label="Code postal"
              errors={errors}
              value={values.parent2Zip}
              transformer={translate}
              className="mr-[8px] flex-[1_1_50%]"
              handleChange={handleChange}
            />
            <Field
              name="parent2City"
              label="Ville"
              errors={errors}
              value={values.parent2City}
              transformer={translate}
              className="flex-[1_1_50%]"
              handleChange={handleChange}
            />
          </div>
          <Field
            name="parent2Country"
            label="Pays"
            errors={errors}
            value={values.parent2Country}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </>
      }
    </>
  );
}

function Representant1({ values, handleChange, required = {}, errors, touched, setFieldValue }) {
  return (
    <>
      <Field
        name="parent1Status"
        label="Statut"
        errors={errors}
        type="select"
        value={values.parent1Status}
        options={[
          { value: "mother", label: "Mère" },
          { value: "father", label: "Père" },
          { value: "representant", label: "Représentant légal" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <div className="mb-[16px] flex items-start justify-between">
        <Field
          name="parent1LastName"
          label="Nom"
          errors={errors}
          value={values.parent1LastName}
          transformer={translate}
          className="mr-[8px] flex-[1_1_50%]"
          handleChange={handleChange}
        />
        <Field
          name="parent1FirstName"
          label="Prénom"
          errors={errors}
          value={values.parent1FirstName}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />
      </div>
      <Field
        name="parent1Email"
        label="Email"
        errors={errors}
        value={values.parent1Email}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      <Field
        name="parent1OwnAddress"
        label="Adresse différente de celle du volontaire"
        errors={errors}
        type="select"
        value={values.parent1OwnAddress}
        options={[
          { value: "true", label: "Oui" },
          { value: "false", label: "Non" },
        ]}
        transformer={translate}
        className="mb-[16px]"
        handleChange={handleChange}
      />
      {values.parent1OwnAddress === "true" &&
        <>
          <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
          <Field
            name="parent1address"
            label="Adresse"
            errors={errors}
            value={values.parent1address}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <div className="mb-[16px] flex items-start justify-between mt-[16px]">
            <Field
              name="parent1Zip"
              label="Code postal"
              errors={errors}
              value={values.parent1Zip}
              transformer={translate}
              className="mr-[8px] flex-[1_1_50%]"
              handleChange={handleChange}
            />
            <Field
              name="parent1City"
              label="Ville"
              errors={errors}
              value={values.parent1City}
              transformer={translate}
              className="flex-[1_1_50%]"
              handleChange={handleChange}
            />
          </div>
          <Field
            name="parent1Country"
            label="Pays"
            errors={errors}
            value={values.parent1Country}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </>
      }
    </>
  );
}

function Situation({ values, handleChange, required = {}, errors, touched, setFieldValue }) {
  const onChange = (e) => {
    for (const key in e) {
      if (e[key] !== values[key]) {
        console.log("CHANGE", key, e[key])
        setFieldValue(key, e[key])
      }
    }

  }
  const onChangeSituation = (e) => {
    setFieldValue("employed", youngEmployedSituationOptions.includes(e.target.value) ? "true" : "false")
    setFieldValue("schooled", youngSchooledSituationOptions.includes(e.target.value) ? "true" : "false")
    setFieldValue("situation", e.target.value);
  }
  const situationOptions = Object.keys(YOUNG_SITUATIONS).map((s) => ({ value: s, label: translate(s) }));
  const gradeOptions = Object.keys(GRADES)
    .filter((g) => g !== GRADES.NOT_SCOLARISE)
    .map((g) => ({ value: g, label: translateGrade(g) }));
  const onParticuliereChange = (key, value) => {
    setFieldValue(key, value);
  }
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Situation</div>
        <Field
          name="situation"
          label="Statut"
          type="select"
          errors={errors}
          value={values.situation}
          transformer={translate}
          className="flex-[1_1_50%]"
          options={situationOptions}
          handleChange={onChangeSituation}
        />
        {values.schooled === "true" &&
          <div className="mt-[16px]">
            <SchoolEditor young={values} onChange={onChange} />
            <Field
              name="grade"
              label="Classe"
              type="select"
              errors={errors}
              value={values.grade}
              transformer={translate}
              className="flex-[1_1_50%]"
              options={gradeOptions}
              handleChange={handleChange}
            />
          </div>
        }
        <div className="mt-[32px]">
          <div className="font-medium text-[12px] mt-[32px] text-[#242526] leading-snug mb-[8px]">Situations particulières</div>
          <FieldSituationsParticulieres
            name="specificSituations"
            young={values}
            mode={"edition"}
            onChange={onParticuliereChange}
          />
          {values.specificAmenagment === "true" && (
            <Field
              name="specificAmenagmentType"
              label="Nature de l'aménagement spécifique"
              errors={errors}
              value={values.specificAmenagmentType}
              mode="edition"
              onChange={handleChange}
              young={values}
            />
          )}
        </div>
      </BoxContent>
    </Box>
  );
}
function Coordonnees({ values, handleChange, setFieldValue, required = {}, errors, touched, validateField }) {

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setFieldValue("addressVerified", "true");
    for (const key in suggestion) {
      if (suggestion[key] !== values[key]) {
        if ((key === "address" || key === "zip" || key === "city")) {
          if (isConfirmed) {
            setFieldValue(key, suggestion[key])
          }
        } else {
          setFieldValue(key, suggestion[key])
        }
      }
    }
  };
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Date et lieu de naissance</div>
        <Field
          name="birthdateAt"
          type="date"
          errors={errors}
          value={values.birthdateAt}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="birthCity"
            label="Ville de naissance"
            errors={errors}
            value={values.birthCity}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="birthCityZip"
            label="Code postal de naissance"
            errors={errors}
            value={values.birthCityZip}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <Field
          name="birthCountry"
          label="Pays de naissance"
          errors={errors}
          value={values.birthCountry}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />

        <div className="font-medium text-[12px] mt-[32px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
        <Field
          name="address"
          label="Adresse"
          errors={errors}
          value={values.address}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="zip"
            label="Code postal"
            errors={errors}
            value={values.zip}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="city"
            label="Ville"
            errors={errors}
            value={values.city}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <VerifyAddress
          address={values.address}
          zip={values.zip}
          city={values.city}
          onSuccess={onVerifyAddress(true)}
          onFail={onVerifyAddress()}
          verifyButtonText="Vérifier l'adresse"
          verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse de résidence, code postale et ville."
          isVerified={values.addressVerified}
          buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
        />
        <div className="mb-[16px] flex items-start justify-between mt-[16px]">
          <Field
            name="department"
            label="Département"
            errors={errors}
            readyOnly={true}
            value={values.department}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="region"
            label="Région"
            errors={errors}
            readyOnly={true}
            value={values.region}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
      </BoxContent>
    </Box>
  );
}

function Identite({ values, handleChange, required = {}, errors, touched }) {
  const genderOptions = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ];
  const handleChangeBool = (e, value) => {
    e.target.value = value;
    handleChange(e);
  }
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Identité et contact</div>
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="lastName"
            label="Nom"
            errors={errors}
            value={values.lastName}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="firstName"
            label="Prénom"
            errors={errors}
            value={values.firstName}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <Field
          name="gender"
          label="Sexe"
          errors={errors}
          value={values.gender}
          className="mb-[16px]"
          type="select"
          options={genderOptions}
          transformer={translate}
          handleChange={handleChange}
        />
        <Field
          name="email"
          label="Email"
          errors={errors}
          value={values.email}
          className="mb-[16px]"
          transformer={translate}
          handleChange={handleChange}
        />
        <Field
          name="phone"
          label="Téléphone"
          errors={errors}
          value={values.phone}
          transformer={translate}
          handleChange={handleChange}
        />
        <div className="mt-[32px]">
          <CniField
            name="cniFile"
            label="Pièce d'identité"
            young={values}
            mode="edition"
            blockUpload={true}
            onStartRequest={null}
            currentRequest={null}
            correctionRequest={false}
            onCorrectionRequestChange={null}
            onChange={handleChange}
          />
        </div>
        <Field
          name="expirationDate"
          label="Date d'expiration de la pièce d'identité"
          type="date"
          errors={errors}
          value={values.expirationDate}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        {(values.expirationDate !== null && new Date(values.expirationDate).getTime() < START_DATE_SESSION_PHASE1[values.cohort].getTime()) &&
          <div className="mt-[16px] w-100 flex flew-row justify-between">
            <div>Attestation sur l'honneur</div>
            {values.parentStatementOfHonorInvalidId === "true" ? (
              <a onClick={(e) => handleChangeBool(e, "false")} name="parentStatementOfHonorInvalidId" className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] text-white bg-[#3B82F6] border rounded-[30px]">Validée</a>
            ) : (
              <a onClick={(e) => handleChangeBool(e, "true")} name="parentStatementOfHonorInvalidId" className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] border rounded-[30px]">Non validée</a>
            )}
          </div>
        }

      </BoxContent>
    </Box>
  );
}

const Wrapper = styled.div`
padding: 20px 40px;
`;

const TitleWrapper = styled.div`
margin: 32px 0;
display: flex;
justify-content: space-between;
align-items: center;
button {
background-color: #5245cc;
border: none;
border-radius: 5px;
padding: 7px 30px;
font-size: 14px;
font-weight: 700;
color: #fff;
cursor: pointer;
:hover {
  background: #372f78;
}
}
`;
const Title = styled.h2`
color: #242526;
font-weight: bold;
font-size: 28px;
`;

const Alert = styled.h3`
border: 1px solid #fc8181;
border-radius: 0.25em;
background-color: #fff5f5;
color: #c53030;
font-weight: 400;
font-size: 12px;
padding: 1em;
text-align: center;
`;

const SaveBtn = styled(LoadingButton)`
background-color: #5245cc;
border: none;
border-radius: 5px;
padding: 7px 30px;
font-size: 14px;
font-weight: 700;
color: #fff;
cursor: pointer;
:hover {
background: #372f78;
}
&.outlined {
:hover {
  background: #fff;
}
background-color: transparent;
border: solid 1px #5245cc;
color: #5245cc;
font-size: 13px;
padding: 4px 20px;
}
`;
