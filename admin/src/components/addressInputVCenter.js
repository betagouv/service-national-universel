import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col, Spinner } from "reactstrap";
import { Field, useField } from "formik";
import ErrorMessage, { requiredMessage } from "./errorMessage";
import { department2region, departmentLookUp, departmentToAcademy, departmentList, regionList } from "../utils";
import InfoIcon from "./InfoIcon";
import countries from "i18n-iso-countries";
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
const countriesList = countries.getNames("fr", { select: "official" });

// eslint-disable-next-line prettier/prettier
export default function addressInputVCenter({
  keys,
  values,
  handleChange,
  errors,
  touched,
  validateField,
  countryVisible = false,
  onChangeCountry = () => {},
  countryByDefault = "",
  required = false,
  departAndRegionVisible = false,
  disabled = false,
}) {
  const [suggestion, setSuggestion] = useState({});
  const [addressInFrance, setAddressInFrance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [addressVerified, _, addressVerifiedHelpers] = useField({
    value: values[keys.addressVerified],
    name: "addressVerified",
    validate: (v) => v !== "true" && (values[keys.address] || values[keys.zip] || values[keys.city]) && addressInFrance && "Il est obligatoire de vérifier l'adresse",
  });

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
    if (!values[keys.country]) handleChange({ target: { name: keys.country, value: countryByDefault } });
  }, []);

  useEffect(() => {
    setAddressInFrance(!values[keys.country] || values[keys.country] === "France");
    if (keys.country && values[keys.country] === undefined) addressVerifiedHelpers.setValue("false");
  }, [values[keys.country]]);

  useEffect(() => {
    const zip = values[keys.zip];
    if (!zip || zip.length < 2) {
      handleChange({ target: { name: keys.department, value: "" } });
      handleChange({ target: { name: keys.region, value: "" } });
      return;
    }
    if (values?.cohort === "2020") return;
    let departmentCode = zip.substr(0, 2);
    if (["97", "98"].includes(departmentCode)) {
      departmentCode = zip.substr(0, 3);
    }
    //POUR LA CORSE
    if (departmentCode === "20") {
      if (zip === "20000" || zip.substr(0, 3) === "201") departmentCode = "2A";
      else departmentCode = "2B";
    }
    handleChange({ target: { name: keys.department, value: departmentLookUp[departmentCode] } });
    handleChange({ target: { name: keys.region, value: department2region[departmentLookUp[departmentCode]] } });
    if (keys.academy) handleChange({ target: { name: keys.academy, value: departmentToAcademy[departmentLookUp[departmentCode]] } });
  }, [values[keys.zip]]);

  const onSuggestionSelected = () => {
    let depart = suggestion.properties.postcode.substr(0, 2);
    if (["97", "98"].includes(depart)) {
      depart = suggestion.properties.postcode.substr(0, 3);
    }
    if (depart === "20") {
      depart = suggestion.properties.context.substr(0, 2);
      if (!["2A", "2B"].includes(depart)) depart = "2B";
    }
    handleChange({ target: { name: keys.city, value: suggestion.properties.city } });
    handleChange({ target: { name: keys.zip, value: suggestion.properties.postcode } });
    handleChange({ target: { name: keys.address, value: suggestion.properties.name } });
    handleChange({ target: { name: keys.location, value: { lon: suggestion.geometry.coordinates[0], lat: suggestion.geometry.coordinates[1] } } });
    if (values?.cohort !== "2020") {
      handleChange({ target: { name: keys.department, value: departmentLookUp[depart] } });
      handleChange({ target: { name: keys.region, value: department2region[departmentLookUp[depart]] } });
    }
    if (keys.cityCode) {
      handleChange({ target: { name: keys.cityCode, value: suggestion.properties.citycode } });
    }
    if (keys.academy && depart) {
      handleChange({ target: { name: keys.academy, value: departmentToAcademy[departmentLookUp[depart]] } });
    }

    setSuggestion({});
    addressVerifiedHelpers.setValue("true");
    addressVerifiedHelpers.setError("");
    return;
  };

  const getSuggestions = async (item) => {
    const errors = await Promise.all([validateField(keys.address), validateField(keys.city), validateField(keys.zip)]).then((arr) => arr.filter((error) => error !== false));
    if (errors.length) return;
    const text = item;

    setLoading(true);
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=1&q=${text}`, {
      mode: "cors",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const res = await response.json();
    const arr = res.features.filter((e) => e.properties.type !== "municipality");

    setLoading(false);
    if (arr.length > 0) setSuggestion({ ok: true, status: "FOUND", ...arr[0] });
    else addressVerifiedHelpers.setValue("true");
  };

  // keys is not defined at first load ??
  if (!keys) return <div />;

  return (
    <Wrapper>
      {suggestion.status !== "FOUND" ? (
        <Row>
          {countryVisible && (
            <Col className="w-full">
              <Label>Pays</Label>
              <Field
                disabled={disabled}
                as="select"
                validate={(v) => required && !v && requiredMessage}
                placeholder="Pays"
                name={keys.country}
                value={values[keys.country]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.country, value } });
                  onChangeCountry();
                }}>
                <option value="" label="Sélectionner un pays" disabled>
                  Sélectionner un pays
                </option>
                {Object.values(countriesList)
                  .sort((a, b) => a.localeCompare(b))
                  .map((countryName) => (
                    <option key={countryName} value={countryName} label={countryName}>
                      {countryName}
                    </option>
                  ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name={keys.country} />
            </Col>
          )}
          <Row className="flex border w-full flex-col justify-items-start mx-3 my-1 rounded-lg rounded-grey-300 p-2">
            <div className="text-gray-500 text-xs">
              <label>Adresse</label>
            </div>
            <Field
              disabled={disabled}
              validate={(v) => required && !v && requiredMessage}
              placeholder="Adresse"
              name={keys.address}
              value={values[keys.address]}
              onChange={(e) => {
                const value = e.target.value;
                handleChange({ target: { name: keys.address, value } });
                addressVerifiedHelpers.setValue("false");
              }}
            />
          </Row>
          <div className="flex w-full">
            <div className="w-1/2 flex border flex-col justify-items-start ml-3 my-1 rounded-lg rounded-grey-300 p-2">
              <div className="text-gray-500 text-xs">
                <label>Code postal</label>
              </div>
              <Field
                disabled={disabled}
                validate={(v) => required && !v && requiredMessage}
                placeholder="Code postal"
                name={keys.zip}
                value={values[keys.zip]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.zip, value } });
                  addressVerifiedHelpers.setValue("false");
                }}
              />
              <ErrorMessage errors={errors} touched={touched} name={keys.zip} />
            </div>
            <div className="w-1/2 flex border flex-col justify-items-start ml-2 mr-3 my-1 rounded-lg rounded-grey-300 p-2">
              <div className="text-gray-500 text-xs">
                <label>Ville</label>
              </div>
              <Field
                disabled={disabled}
                validate={(v) => required && !v && requiredMessage}
                placeholder="Ville"
                name={keys.city}
                value={values[keys.city]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.city, value } });
                  addressVerifiedHelpers.setValue("false");
                }}
              />
              <ErrorMessage errors={errors} touched={touched} name={keys.city} />
            </div>
          </div>
          {departAndRegionVisible ? (
            <div className=" flex w-full ">
              <div className=" bg-gray-200 flex border flex-col ml-3 my-1 rounded-lg rounded-grey-300 p-2 w-full">
                <div className=" text-gray-500 text-xs">
                  <label>Département</label>
                </div>
                <Field
                  as="select"
                  validate={(v) => !v && requiredMessage}
                  disabled
                  placeholder="Département"
                  className="w-full bg-gray-200"
                  name={keys.department}
                  value={values[keys.department]}>
                  {departmentList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Field>
                <ErrorMessage errors={errors} touched={touched} name={keys.department} />
              </div>
              <div className="bg-gray-200 flex border flex-col ml-2 mr-3 my-1 rounded-lg rounded-grey-300 p-2 w-full">
                <div className="text-gray-500 text-xs">
                  <label>Région</label>
                </div>
                <Field
                  as="select"
                  validate={(v) => !v && requiredMessage}
                  disabled
                  placeholder="Région"
                  name={keys.region}
                  value={values[keys.region]}
                  className="w-full bg-gray-200">
                  {regionList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Field>
                <ErrorMessage errors={errors} touched={touched} name={keys.region} />
              </div>
            </div>
          ) : null}
          {addressInFrance ? (
            <>
              <Col md={12} style={{ display: "flex", alignItems: "flex-end" }}>
                {addressVerified.value !== "true" ? (
                  <PrimaryButton style={{ marginLeft: "auto" }} onClick={() => getSuggestions(`${values[keys.address]}, ${values[keys.city]} ${values[keys.zip]}`)}>
                    {!loading ? "Vérifier" : <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
                  </PrimaryButton>
                ) : (
                  <div style={{ display: "flex", color: "#32257f", backgroundColor: "#edecfc", padding: "1rem", borderRadius: "6px", width: "100%", marginTop: "10px" }}>
                    <InfoIcon color="#32257F" style={{ flex: "none" }} />
                    <div style={{ fontSize: ".9rem", marginLeft: "5px" }}>L&apos;adresse a été vérifiée</div>
                  </div>
                )}
              </Col>
              <ErrorMessage errors={errors} touched={touched} name="addressVerified" />
            </>
          ) : null}
        </Row>
      ) : (
        <Row>
          <Col md={12} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <b style={{ marginBottom: "16px" }}>Est-ce que c&apos;est la bonne adresse ?</b>
            <p>{suggestion.properties.name}</p>
            <p>{`${suggestion.properties.postcode}, ${suggestion.properties.city}`}</p>
            <p>France</p>
            <div style={{ display: "flex" }}>
              <SecondaryButton
                onClick={() => {
                  setSuggestion({});
                  addressVerifiedHelpers.setValue("true");
                }}>
                Non
              </SecondaryButton>
              <PrimaryButton onClick={onSuggestionSelected}>Oui</PrimaryButton>
            </div>
            <ErrorMessage errors={errors} touched={touched} name="addressVerified" />
          </Col>
        </Row>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .react-autosuggest__container {
    position: relative;
  }
  .react-autosuggest__suggestions-list {
    position: absolute;
    background-color: white;
    margin: 0;
    width: 100%;
    z-index: 10;
    left: 0px;
    top: 106%;
    border: 1px solid #ddd;
    padding: 5px 0;
    border-radius: 6px;
  }
  .react-autosuggest__suggestions-list li {
    cursor: pointer;
    padding: 7px 10px;
    :hover {
      background-color: #f3f3f3;
    }
  }
  .react-autosuggest__suggestion--highlighted {
    background-color: #f3f3f3;
  }
`;

const PrimaryButton = styled.button`
  color: #fff;
  border: 0;
  background-color: #5145cd;
  padding: 9px 20px;
  outline: 0;
  border-radius: 6px;
  margin-inline: 5px;
  margin-top: 10px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -2px rgb(0 0 0 / 5%);
  width: fit-content;
  :hover {
    opacity: 0.9;
  }
`;

const SecondaryButton = styled.button`
  border: solid 2px;
  border-color: #e3e7ea;
  background-color: #fff;
  padding: 9px 20px;
  outline: 0;
  border-radius: 6px;
  margin-inline: 5px;
  margin-top: 10px;
  display: block;
  outline: 0;
  width: fit-content;
`;

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
`;
