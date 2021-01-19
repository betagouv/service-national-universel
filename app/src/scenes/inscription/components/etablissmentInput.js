import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Autosuggest from "react-autosuggest";
import { Row, Col, Input } from "reactstrap";
import { Field } from "formik";
import { departmentLookUp } from "../../../utils";

import api from "../../../services/api";

export default ({ handleChange, values }) => {
  const [other, setOther] = useState(false);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  return (
    <Row>
      <Col md={12} style={{ marginTop: 15 }}>
        <AutoComplete
          onSelect={(suggestion) => {
            setOther(suggestion.type === "AUTRE");

            function getDepartment() {
              if (!suggestion.department) return "";
              let d = suggestion.department;
              d = d.replace(/^0+/, "");
              if (d < 10) d = "0" + d;
              d = departmentLookUp[d];
              return d;
            }

            let depart = getDepartment();

            handleChange({ target: { name: "schoolId", value: suggestion._id } });
            handleChange({ target: { name: "schoolCity", value: suggestion.city } });
            handleChange({ target: { name: "schoolZip", value: suggestion.postcode } });
            handleChange({ target: { name: "schoolDepartment", value: departmentLookUp[depart] } });
            handleChange({ target: { name: "schoolName", value: suggestion.name2 } });
            handleChange({ target: { name: "schoolType", value: suggestion.type } });
          }}
          placeholder="Recherche par nom, code postal, ville ..."
        />
      </Col>
      <Col md={6} style={{ marginTop: 15 }}>
        <Label>Ville</Label>
        <Field disabled={!other} style={{ maxWidth: 500 }} className="form-control" placeholder="Ville" name="schoolCity" value={values.schoolCity} onChange={handleChange} />
      </Col>
      <Col md={4} style={{ marginTop: 15 }}>
        <Label>Code postal</Label>
        <Field disabled={!other} style={{ maxWidth: 500 }} className="form-control" placeholder="Code postal" name="schoolZip" value={values.schoolZip} onChange={handleChange} />
      </Col>
      <Col md={12} style={{ marginTop: 15 }}>
        <Label>Type d'établissement</Label>
        <Input disabled style={{ maxWidth: 500 }} name="schoolType" placeholder="Type d'établissement" value={values.schoolType} onChange={handleChange} />
      </Col>
      <Col md={12} style={{ marginTop: 15 }}>
        <Label>Etablissement scolaire</Label>
        <Input disabled={!other} placeholder="Nom de l'établissement scolaire" name="schoolName" value={values.schoolName} onChange={handleChange} />
      </Col>
    </Row>
  );
};

const AutoComplete = ({ placeholder, onSelect }) => {
  const [hits, setHits] = useState([]);
  const [value, setValue] = useState("");

  const onSuggestionsFetchRequested = async ({ value }) => {
    setHits(await getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setHits([]);
  };

  const onSuggestionSelected = async (event, { suggestion }) => {
    onSelect(suggestion);
  };

  const renderSuggestion = (suggestion) => (
    <div style={{ fontSize: 12 }}>
      <strong>{suggestion.name2 || "RENTREZ MANUELLEMENT L'ETABLISSEMENT"}</strong>
      <div>
        {suggestion.city} {suggestion.city && ","} {suggestion.postcode}
      </div>
      <div style={{ color: "#aaa" }}>{suggestion.type}</div>
    </div>
  );
  const getSuggestionValue = () => "";

  const getSuggestions = async (text) => {
    const queries = [];
    queries.push({ index: "school", type: "_doc" });
    queries.push({ query: { multi_match: { query: text, type: "most_fields", fields: ["name2", "city", "type", "postcode"] } } });
    const { responses } = await api.esQuery(queries);
    console.log("responses", responses);
    const hits = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
    // if (hits.length) return setHits(hits);
    hits.push({ name2: "", city: "", postcode: "", type: "AUTRE" });
    return hits;
  };

  return (
    <Wrapper>
      <Autosuggest
        suggestions={hits}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={{
          value,
          onChange: (event, { newValue }) => setValue(newValue),
          placeholder,
          className: "form-control",
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .react-autosuggest__container {
    position: relative;
    max-width: 500px;
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
    max-height: 300px;
    overflow-y: auto;
  }
  .react-autosuggest__suggestions-list li {
    cursor: pointer;
    padding: 7px 10px;
    text-transform: capitalize;
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
