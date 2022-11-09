import React from "react";
import styled from "styled-components";
import { Formik } from "formik";
import validator from "validator";
import "dayjs/locale/fr";

import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import SituationsParticulieres from "./edit/situations-particulieres";
import Representant1 from "./edit/representant-legal1";
import Representant2 from "./edit/representant-legal2";
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
  const options = ["Juillet 2022", "à venir"];
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

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

  function validateEmpty(value, name, errors, message = "Ne peut être vide") {
    // console.log("test ", name, value, !value[name] || validator.isEmpty(value[name], { ignore_whitespace: true }));
    if (!value[name] || validator.isEmpty(value[name], { ignore_whitespace: true })) {
      errors[name] = message;
      return false;
    } else {
      return true;
    }
  }
  const validate = (values, props /* only available when using withFormik */) => {
    const errors = {};
    const required = ["firstName", "lastName", "birthdateAt", "birthCityZip", "birthCity", "gender", "birthCountry", "phone", "cohort", "parentStatementOfHonorInvalidId"]
    if (!values.email) {
      errors.email = 'Ne peut être vide';

    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Adresse email invalide';

    }
    for (const key in values) {
      if (required.includes(key) && (!values[key] || validator.isEmpty(values[key], { ignore_whitespace: true }) || values[key] === null)) {
        errors[key] = 'Ne peut être vide';
      }
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
          files: {
            cniFiles: [],
            highSkilledActivityProofFiles: [],
            parentConsentmentFiles: [],
            imageRightFiles: [],
          },
          email: "",
          expirationDate: null,
          phone: "",
          cohort: options[0],
          parentStatementOfHonorInvalidId: "false",
          addressObject: {
            addressVerified: false,
            zip: "",
            city: "",
            region: "",
            department: "",
            address: "",
          },
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
        }}
        validateOnBlur={false}
        validateOnChange={false}
        validate={validate}
        onSubmit={async (values) => {
          try {
            const transformedObject = Object.assign({}, values);
            transformedObject.addressVerified = values.addressObject.addressVerified.toString();
            transformedObject.zip = values.addressObject.zip;
            transformedObject.city = values.addressObject.city;
            transformedObject.region = values.addressObject.region;
            transformedObject.department = values.addressObject.department;
            transformedObject.address = values.addressObject.address;
            delete transformedObject.addressObject;
            console.log("Transformed object", transformedObject);

            const { ok, code } = await api.post("/young/invite", transformedObject);
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
            <div className="flex items-center justify-between my-8">
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Valider cette candidature
              </SaveBtn>
            </div>
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[27px]">
              <div className="text-[25px] font-[700] flex items-center justify-center">Créer une inscription manuellement</div>
              <div className={"p-[32px]"}>
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
            </div>
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
              <div className="ml-[32px] text-[18px] font-[500]">Informations générales</div>
              <div className={`flex ${false ? "hidden" : "block"}`}>
                <div className="flex-[1_0_50%] pr-[56px]">
                  <Situation values={values} handleChange={handleChange} required={{ situation: true }} errors={errors} setFieldValue={setFieldValue} touched={touched} />
                </div>
                <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
                <div className="flex-[1_0_50%] pl-[56px]">
                  <Representant1 values={values} handleChange={handleChange} />
                </div>
              </div>
            </div>
            {/* 
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[27px]">
              <SituationsParticulieres values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <div className="flex-[1_0_50%] pl-[56px]">
                <Row>
                  <Representant2 values={values} handleChange={handleChange} />
                </Row>
                <Row>
                  <Consentement values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
                  <ConsentementImage values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
                </Row>
              </div>
            </div>
            */}

          </>
        )}
      </Formik>
    </Wrapper >
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
          className="mr-[8px] flex-[1_1_50%]"
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
              className="mr-[8px] flex-[1_1_50%]"
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
    setFieldValue("addressObject", {
      addressVerified: true,
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : values.addressObject.address,
      zip: isConfirmed ? suggestion.zip : values.addressObject.zip,
      city: isConfirmed ? suggestion.city : values.addressObject.city,
    })
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
          name="addressObject.address"
          label="Adresse"
          errors={errors}
          value={values.addressObject.address}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="addressObject.zip"
            label="Code postal"
            errors={errors}
            value={values.addressObject.zip}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="addressObject.city"
            label="Ville"
            errors={errors}
            value={values.addressObject.city}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <VerifyAddress
          address={values.addressObject.address}
          zip={values.addressObject.zip}
          city={values.addressObject.city}
          onSuccess={onVerifyAddress(true)}
          onFail={onVerifyAddress()}
          isVerified={values.addressObject.addressVerified}
          buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
        />
        <div className="mb-[16px] flex items-start justify-between mt-[16px]">
          <Field
            name="addressObject.department"
            label="Département"
            errors={errors}
            value={values.addressObject.department}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="addressObject.region"
            label="Région"
            errors={errors}
            value={values.addressObject.region}
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
        <div className="mt-[16px] w-100 flex flew-row justify-between">
          <div>Attestation sur l'honneur</div>
          {values.parentStatementOfHonorInvalidId === "true" ? (
            <a onClick={(e) => handleChangeBool(e, "false")} name="parentStatementOfHonorInvalidId" className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] text-white bg-[#3B82F6] border rounded-[30px]">Validée</a>
          ) : (
            <a onClick={(e) => handleChangeBool(e, "true")} name="parentStatementOfHonorInvalidId" className="p-[10px] text-center leading-[22px] pt-[1px] pb-[1px] border-[0.5px] cursor-pointer border-[#D1D5DB] border rounded-[30px]">Non validée</a>
          )}
        </div>
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
