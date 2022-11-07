import React from "react";
import styled from "styled-components";
import { Formik } from "formik";
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

//Identite
import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import Field from "./components/Field";
import Documents from "./components/Documents";
import DndFileInput from "../../components/dndFileInputV2";
import { CniField } from "../phase0/components/CniField";

import VerifyAddress from "../phase0/components/VerifyAddress";


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
          address: "",
          city: "",
          zip: "",
          department: "",
          region: "",
          cohort: options[0],
        }}
        validateOnBlur={false}
        validateOnChange={false}
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
            <div className="flex items-center justify-between my-8">
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Valider cette candidature
              </SaveBtn>
            </div>
            {Object.values(errors).filter((e) => !!e).length ? (
              <Alert>Vous ne pouvez pas enregistrer ce volontaires car tous les champs ne sont pas correctement renseignés.</Alert>
            ) : null}
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
                      required={{ firstName: true, lastName: true, birthdateAt: true, gender: true }}
                      errors={errors}
                      touched={touched}
                    />
                  </div>
                  <div className="w-[1px] my-[73px] bg-[#E5E7EB] flex-[0_0_1px]" />
                  <div className="flex-[1_0_50%] pl-[56px]">
                    <Coordonnees
                      values={values}
                      handleChange={handleChange}
                      required={{ email: true, phone: true, address: true, city: true, zip: true, department: true, region: true }}
                      errors={errors}
                      touched={touched}
                      validateField={validateField}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative bg-[#FFFFFF] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] rounded-[8px] mb-[24px] pt-[24px]">
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
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Date et lieu de naissance</div>
      </BoxContent>
    </Box>
  );
}
function Coordonnees({ values, handleChange, required = {}, errors, touched, validateField }) {
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
  };
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Date et lieu de naissance</div>
        <Field
          name="birthdateAt"
          type="date"
          value={values.birthdateAt}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="birthCity"
            label="Ville de naissance"
            value={values.birthCity}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="birthCityZip"
            label="Code postal de naissance"
            value={values.birthCityZip}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <Field
          name="birthCountry"
          label="Pays de naissance"
          value={values.birthCountry}
          transformer={translate}
          className="flex-[1_1_50%]"
          handleChange={handleChange}
        />

        <div className="font-medium text-[12px] mt-[32px] text-[#242526] leading-snug mb-[8px]">Adresse</div>
        <Field
          name="adress"
          label="Adresse"
          value={values.adress}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="zip"
            label="Code postal"
            value={values.zip}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="city"
            label="Ville"
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
          isVerified={values.addressVerified === true}
          buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
        />
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="zip"
            label="Département"
            value={values.department}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="city"
            label="Région"
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
  return (
    <Box>
      <BoxContent direction="column">
        <div className="font-medium text-[12px] text-[#242526] leading-snug mb-[8px]">Identité et contact</div>
        <div className="mb-[16px] flex items-start justify-between">
          <Field
            name="lastName"
            label="Nom"
            value={values.lastName}
            transformer={translate}
            className="mr-[8px] flex-[1_1_50%]"
            handleChange={handleChange}
          />
          <Field
            name="firstName"
            label="Prénom"
            value={values.firstName}
            transformer={translate}
            className="flex-[1_1_50%]"
            handleChange={handleChange}
          />
        </div>
        <Field
          name="gender"
          label="Sexe"
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
          value={values.email}
          className="mb-[16px]"
          transformer={translate}
          handleChange={handleChange}
        />
        <Field
          name="phone"
          label="Téléphone"
          value={values.phone}
          transformer={translate}
          handleChange={handleChange}
        />
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
        <Field
          name="expirationDate"
          label="Date d'expiration de la pièce d'identité"
          type="date"
          value={values.expirationDate}
          transformer={translate}
          className="mb-[16px]"
          handleChange={handleChange}
        />
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
