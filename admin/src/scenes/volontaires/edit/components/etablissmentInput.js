import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Row, Col } from "reactstrap";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../../../../components/errorMessage";
import api from "../../../../services/api";
import countries from "i18n-iso-countries";
import { YOUNG_SITUATIONS, translate, ROLES } from "../../../../utils";

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));
const countriesList = countries.getNames("fr", { select: "official" });
const NORESULTMESSAGE = "Aucun résultat trouvé";

export default function EtablissementInput({ handleChange, values, keys, errors, touched, setFieldValue, required }) {
  const user = useSelector((state) => state.Auth.user);

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
        <Label style={{ marginTop: 0 }}>Statut</Label>
        <Field hidden value={values.situation} name="situation" onChange={handleChange} validate={(v) => required && !v && requiredMessage} />
        <select
          disabled={user.role !== ROLES.ADMIN && values._id}
          className="form-control"
          name="situation"
          value={values.situation}
          onChange={handleChange}
          validate={(v) => required && !v && requiredMessage}>
          <option disabled key={-1} value="" selected={!values.situation} label="Statut">
            &quot;Statut&quot;
          </option>
          {Object.keys(YOUNG_SITUATIONS)
            .map((s) => ({ value: s, label: translate(s) }))
            .map((o, i) => (
              <option key={i} value={o.value} label={o.label}>
                {o.label}
              </option>
            ))}
        </select>
        {errors && touched && <ErrorMessage errors={errors} touched={touched} name="situation" />}
      </Col>
      <Col md={12}>
        <Label>Pays de l&apos;établissement</Label>
        <Field
          as="select"
          validate={(v) => required && !v && requiredMessage}
          className="form-control"
          placeholder="Pays"
          name={keys.schoolCountry}
          value={values[keys.schoolCountry]}
          onChange={(e) => {
            handleChange(e);
            setFieldValue(keys.schoolName, "");
            setFieldValue(keys.schoolCity, "");
            setFieldValue(keys.schoolId, "");
          }}>
          {Object.values(countriesList)
            .sort((a, b) => a.localeCompare(b))
            .map((countryName) => (
              <option key={countryName} value={countryName}>
                {countryName}
              </option>
            ))}
        </Field>
      </Col>

      <Col md={12}>
        {values[keys.schoolCountry] === "France" && (
          <>
            <Label>Ville de l&apos;établissement</Label>
            <SchoolCityTypeahead
              initialValue={values[keys.schoolCity] || ""}
              onChange={(text) => {
                setFieldValue(keys.schoolCity, text);
                setFieldValue(keys.schoolName, "");
                setFieldValue(keys.schoolId, "");
              }}
            />
            <ErrorMessage errors={errors} touched={touched} name={keys.schoolCity} />
          </>
        )}

        <Label>Nom de l&apos;établissement</Label>
        <SchoolNameTypeahead
          initialValue={values[keys.schoolName] || ""}
          country={values[keys.schoolCountry]}
          city={values[keys.schoolCity]}
          disabled={values[keys.schoolCountry] === "France" && !values[keys.schoolCity]}
          onChange={({ name, id }) => {
            setFieldValue(keys.schoolName, name);
            setFieldValue(keys.schoolId, id);
          }}
        />
        <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />
        <Label>Niveau scolaire</Label>
        <Field
          as="select"
          className="form-control"
          name={keys.grade}
          value={values[keys.grade]}
          validate={(v) => required && !v && requiredMessage}
          onChange={(e) => {
            const value = e.target.value;
            handleChange({ target: { name: keys.grade, value } });
          }}
          defaultValue="">
          <option key="" value="" disabled>
            Sélectionner votre niveau scolaire
          </option>
          {[
            { label: "3ème", value: "3eme" },
            { label: "2nd", value: "2nd" },
            { label: "1ère", value: "1ere" },
            { label: "1ère année CAP", value: "1ere CAP" },
            { label: "Terminale", value: "Terminale" },
            { label: "Terminale CAP", value: "Terminale CAP" },
            { label: "SEGPA", value: "SEGPA" },
            { label: "Classe relais", value: "Classe relais" },
            { label: "Autre", value: "Autre" },
          ].map((rank) => (
            <option key={rank.value} value={rank.value}>
              {`${rank.label}`}
            </option>
          ))}
        </Field>
        <ErrorMessage errors={errors} touched={touched} name={keys.grade} />
      </Col>
    </Row>
  );
}

function SchoolCityTypeahead({ onChange, initialValue }) {
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
          try {
            const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${text}&boost=population&fields=departement&limit=10`, {
              mode: "cors",
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            const res = await response.json();
            return setSuggestions(res.slice(0, 10));
          } catch (error) {
            console.log(error);
          }
        }}
        onSuggestionsClearRequested={() => setSuggestions([])}
        getSuggestionValue={(suggestion) => (suggestion !== "noresult" ? `${suggestion.nom}` : "")}
        onSuggestionSelected={(event, { suggestion }) => {}}
        renderSuggestion={(suggestion) => (
          <div>
            {suggestion !== "noresult" ? (
              <>
                <b>{suggestion.nom}</b>, {suggestion.departement?.code} - {suggestion.departement?.nom}
              </>
            ) : (
              NORESULTMESSAGE
            )}
          </div>
        )}
        inputProps={{
          placeholder: "Indiquez un nom de ville",
          value,
          onChange: (event, { newValue }) => {
            setValue(newValue);
            onChange(newValue);
          },
          className: "form-control",
        }}
      />
    </TypeaheadWrapper>
  );
}

function SchoolNameTypeahead({ onChange, country, city, initialValue, disabled = false }) {
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
          if (country === "France") {
            filter.push({ term: { "city.keyword": city } });
          } else {
            filter.push({ term: { "country.keyword": country } });
          }
          const { responses } = await api.esQuery("school", {
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
          placeholder: disabled ? "Vous pouvez indiquer le nom seulement après avoir renseigné la ville" : "Indiquez le nom de l'établissement",
          value,
          disabled,
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
    list-style-type: none;
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
