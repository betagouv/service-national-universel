import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";
import api from "../../../services/api";
import countries from "i18n-iso-countries";

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
const countriesList = countries.getNames("fr", { select: "official" });
const NORESULTMESSAGE = "Aucun résultat trouvé";

export default function YoungInput({ handleChange, values, cohort, keys, errors, touched, setFieldValue }) {
  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
    if (!values[keys.schoolCountry]) setFieldValue(keys.schoolCountry, "France");
  }, []);

  return (
    <Row>
      <Col md={12}>
        {/* // Penser à ajouter comme filtre le séjour concerné */}
        <SchoolNameTypeahead
          initialValue={values[keys.name] || ""}
          cohort={cohort}
          onChange={({ name, id }) => {
            setFieldValue(keys.schoolName, name);
            setFieldValue(keys.schoolId, id);
          }}
        />
        <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />
      </Col>
    </Row>
  );
}

function SchoolNameTypeahead({ onChange, country, cohort, initialValue }) {
  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <TypeaheadWrapper>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={async ({ value: text }) => {
          let filter = [{ term: { "version.keyword": "2" } }];
          const { responses } = await api.esQuery("young", {
            query: {
              bool: {
                must: { match_bool_prefix: { fullName: { operator: "and", query: (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "") } } },
                filter,
              },
            },
            size: 100,
          });

          const hitsFormatted = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })).sort((a, b) => a.fullName.localeCompare(b.fullName));
          setSuggestions(hitsFormatted);
        }}
        onSuggestionsClearRequested={() => setSuggestions([])}
        getSuggestionValue={(suggestion) => (suggestion !== "noresult" ? `${suggestion.fullName}` : "")}
        renderSuggestion={(suggestion) => (
          <div>
            {suggestion !== "noresult" ? (
              <>
                <b>{suggestion.fullName}</b>, {suggestion.postcode} {suggestion.city}
              </>
            ) : (
              NORESULTMESSAGE
            )}
          </div>
        )}
        inputProps={{
          placeholder: "Indiquez le nom de l'établissement",
          value,
          onChange: (event, { newValue }) => {
            setValue(newValue);
            onChange({ name: newValue, id: suggestions.find((e) => e.fullName === newValue)?._id || "" });
          },
          className: "form-control",
        }}
      />
    </TypeaheadWrapper>
  );
}

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
`;

const TypeaheadWrapper = styled.div`
  .react-autosuggest__container {
    position: relative;
    > input {
      width: 100%;
      max-width: 100%;
    }
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
    font-size: 14px;
    padding: 5px 7px;
    color: #777;
    :hover {
      background-color: #f3f3f3;
    }
    b {
      font-weight: 500;
      color: #000;
    }
  }
  .react-autosuggest__suggestion--highlighted {
    background-color: #f3f3f3;
  }
`;
