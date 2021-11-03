import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import Autosuggest from "react-autosuggest";
import { Field } from "formik";
import { department2region, departmentLookUp, departmentList, regionList, region2department } from "../utils";
import ErrorMessage, { requiredMessage } from "../scenes/inscription/components/errorMessage";
import { countries } from "countries-list";

const NORESULTMESSAGE = "Rentrer manuellement l'adresse";

export default ({ keys, values, handleChange, errors, touched, departAndRegionVisible = true, countryVisible = false }) => {
  const [str, setStr] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [noResultMode, setNoResultMode] = useState(false);
  const [addressInFrance, setAddressInFrance] = useState(true);

  const [departmentListFiltered, setDepartmentListFiltered] = useState(departmentList);
  const [regionListFiltered, setRegionListFiltered] = useState(regionList);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
    if (!values[keys.country]) handleChange({ target: { name: keys.country, value: "France" } });
  }, []);

  useEffect(() => {
    setAddressInFrance(values[keys.country] === "France");
  }, [values[keys.country]]);

  const onSuggestionsFetchRequested = ({ value }) => setSuggestions(getSuggestions(value));
  const onSuggestionsClearRequested = () => setSuggestions([]);

  const onSuggestionSelected = (event, { suggestion }) => {
    if (suggestion === "noresult") {
      handleChange({ target: { name: keys.location, value: null } });
      return setNoResultMode(true);
    }
    setNoResultMode(false);

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
    if (values.cohort !== "2020") {
      handleChange({ target: { name: keys.department, value: departmentLookUp[depart] } });
      handleChange({ target: { name: keys.region, value: department2region[departmentLookUp[depart]] } });
    }
    return;
  };

  const renderSuggestion = (suggestion) => <div>{suggestion !== "noresult" ? suggestion.properties.label : NORESULTMESSAGE}</div>;
  const getSuggestionValue = (suggestion) => (suggestion !== "noresult" ? suggestion.properties.label : "");

  const getSuggestions = async (item) => {
    const text = item;
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=1&q=${text}`, {
      mode: "cors",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const res = await response.json();
    const arr = res.features.filter((e) => e.properties.type !== "municipality");
    arr.push("noresult");
    setSuggestions(arr);
  };

  // keys is not defined at first load ??
  if (!keys) return <div />;

  return (
    <Wrapper>
      <Row>
        {countryVisible && (
          <Col md={addressInFrance ? 4 : 12}>
            <Field
              as="select"
              validate={(v) => !v && requiredMessage}
              className="form-control"
              placeholder="Sélectionnez votre pays de résidence"
              name={keys.country}
              value={values[keys.country]}
              onChange={(e) => {
                const value = e.target.value;
                handleChange({ target: { name: keys.country, value } });
              }}
            >
              {Object.keys(countries).map((country_id) => (
                <option key={country_id} value={countries[country_id].name}>
                  {`${countries[country_id].emoji} ${countries[country_id].name}`}
                </option>
              ))}
            </Field>
          </Col>
        )}
        {addressInFrance && (
          <Col md={countryVisible ? 8 : 12}>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              onSuggestionSelected={onSuggestionSelected}
              renderSuggestion={renderSuggestion}
              inputProps={{
                placeholder: "Commencez à taper votre adresse",
                value: str,
                onChange: (event, { newValue }) => setStr(newValue),
                className: "form-control",
              }}
            />
          </Col>
        )}
        <Col md={12} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            disabled={addressInFrance && !noResultMode}
            className="form-control"
            placeholder="Renseignez votre adresse"
            name={keys.address}
            value={values[keys.address]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.address, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.address} />
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            disabled={addressInFrance && !noResultMode}
            className="form-control"
            placeholder="Ville"
            name={keys.city}
            value={values[keys.city]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.city, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.city} />
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Field
            validate={(v) => !v && requiredMessage}
            disabled={addressInFrance && !noResultMode}
            className="form-control"
            placeholder="Code postal"
            name={keys.zip}
            value={values[keys.zip]}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.zip, value } });
            }}
          />
          <ErrorMessage errors={errors} touched={touched} name={keys.zip} />
        </Col>
        {departAndRegionVisible && addressInFrance ? (
          <>
            <Col md={6} style={{ marginTop: 15 }}>
              <Label>Département</Label>
              <Field
                as="select"
                validate={(v) => !v && requiredMessage}
                disabled={addressInFrance && !noResultMode}
                className="form-control"
                placeholder="Département"
                name={keys.department}
                value={values[keys.department]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.department, value } });
                  // filter and preselect the region
                  setRegionListFiltered(value ? [department2region[value]] : regionList);
                  handleChange({ target: { name: keys.region, value: department2region[value] || "" } });
                }}
              >
                <option label=""></option>
                {departmentListFiltered.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name={keys.department} />
            </Col>
            <Col md={6} style={{ marginTop: 15 }}>
              <Label>Région</Label>
              <Field
                as="select"
                validate={(v) => !v && requiredMessage}
                disabled={addressInFrance && !noResultMode}
                className="form-control"
                placeholder="Région"
                name={keys.region}
                value={values[keys.region]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.region, value } });
                  // filter departments
                  setDepartmentListFiltered(value ? region2department[value] : departmentList);
                }}
              >
                <option label=""></option>
                {regionListFiltered.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name={keys.region} />
            </Col>
          </>
        ) : null}
      </Row>
    </Wrapper>
  );
};

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

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
`;
