import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import Autosuggest from "react-autosuggest";
import { Field } from "formik";
import { department2region, departmentLookUp, departmentList, regionList, region2department } from "../utils";
import ErrorMessage, { requiredMessage } from "./errorMessage";
import validator from "validator";
import { capture } from "../sentry";
import { apiAdress } from "../services/api-adresse";

const NORESULTMESSAGE = "Rentrer manuellement l'adresse";

export default function AddressInput({ keys, values, handleChange, errors, touched, required = true }) {
  const [str, setStr] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [noResultMode, setNoResultMode] = useState(false);

  const [departmentListFiltered, setDepartmentListFiltered] = useState(departmentList);
  const [regionListFiltered, setRegionListFiltered] = useState(regionList);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

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
    handleChange({ target: { name: keys.department, value: departmentLookUp[depart] } });
    handleChange({ target: { name: keys.region, value: department2region[departmentLookUp[depart]] } });
  };

  const renderSuggestion = (suggestion) => <div>{suggestion !== "noresult" ? suggestion.properties.label : NORESULTMESSAGE}</div>;
  const getSuggestionValue = (suggestion) => (suggestion !== "noresult" ? suggestion.properties.label : "");

  const getSuggestions = async (item) => {
    try {
      const text = item;
      const res = await apiAdress(`${encodeURIComponent(text)}`);
      let arr = res?.features?.filter((e) => e.properties.type !== "municipality");
      if (!arr) arr = [];
      arr.push("noresult");
      setSuggestions(arr);
    } catch (e) {
      capture(e);
    }
  };

  // keys is not defined at first load ??
  if (!keys) return <div />;

  return (
    <Wrapper>
      <Row>
        <Col md={6} style={{ marginTop: 46 }}>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            onSuggestionSelected={onSuggestionSelected}
            renderSuggestion={renderSuggestion}
            inputProps={{
              placeholder: "Commencez à tapez votre adresse",
              value: str,
              onChange: (event, { newValue }) => setStr(newValue),
              className: "form-control",
            }}
          />
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Label>Adresse auto-complétée</Label>
          <Field
            validate={(v) => required && !v && requiredMessage}
            disabled={!noResultMode}
            className="form-control"
            placeholder="Adresse"
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
          <Row>
            <Col md={6}>
              <Label>Département</Label>
              <Field
                as="select"
                validate={(v) => required && !v && requiredMessage}
                disabled={!noResultMode}
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
                }}>
                <option label=""></option>
                {departmentListFiltered?.sort()?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name={keys.department} />
            </Col>
            <Col md={6}>
              <Label>Région</Label>
              <Field
                as="select"
                validate={(v) => required && !v && requiredMessage}
                disabled={!noResultMode}
                className="form-control"
                placeholder="Région"
                name={keys.region}
                value={values[keys.region]}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.region, value } });
                  // filter departments
                  setDepartmentListFiltered(value ? region2department[value] : departmentList);
                }}>
                <option label=""></option>
                {regionListFiltered?.sort()?.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Field>
              <ErrorMessage errors={errors} touched={touched} name={keys.region} />
            </Col>
          </Row>
        </Col>
        <Col md={6} style={{ marginTop: 15 }}>
          <Row>
            <Col md={6}>
              <Label>Ville</Label>
              <Field
                validate={(v) => required && !v && requiredMessage}
                disabled={!noResultMode}
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
            <Col md={6}>
              <Label>Code postal</Label>
              <Field
                validate={(v) =>
                  required && ((!v && requiredMessage) || (!validator.isPostalCode(v, "FR") && "Ce champ est au mauvais format. Exemples de format attendu : 44000, 08300"))
                }
                disabled={!noResultMode}
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
          </Row>
        </Col>
      </Row>
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

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
`;
