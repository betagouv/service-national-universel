import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col, Input } from "reactstrap";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";

import api from "../../../services/api";
import SchoolCityTypeahead from "../../../components/SchoolCityTypeahead";

export default ({ handleChange, values, keys, errors, touched }) => {
  const [hits, setHits] = useState([]);
  const [manual, setManual] = useState(false);
  const [showManualButton, setShowManualButton] = useState(false);
  const [emptySearch, setEmptySearch] = useState(false);

  const getSuggestions = async (text) => {
    if (!text.includes(" - ")) return [];

    const [city, postcode] = text.split(" - ");
    const { responses } = await api.esQuery("school", {
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ term: { "city.keyword": city } }, { term: { "postcode.keyword": postcode } }, { term: { "version.keyword": "2" } }],
        },
      },
      size: 100,
    });
    setHits(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })).sort((a, b) => a.fullName.localeCompare(b.fullName)));
    if (hits.length) setManual(false);
    return hits;
  };

  useEffect(() => {
    (async () => {
      if (emptySearch && values[keys.schoolId]) {
        const { responses } = await api.esQuery("school", {
          query: { ids: { values: [values[keys.schoolId]] } },
        });
        setHits(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
        return hits;
      }
    })();
  }, [values[keys.schoolId], emptySearch]);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  return (
    <Row>
      <Col md={12} style={{ marginTop: 15 }}>
        <Label>Ville et code postal de l'établissement</Label>
        <SchoolCityTypeahead
          onChange={(e) => {
            if (e !== "") {
              setTimeout(() => {
                setShowManualButton(true);
              }, 5000);
            }
            setEmptySearch(!e?.length);
            handleChange({ target: { name: keys.schoolId, value: "" } });
            getSuggestions(e);
          }}
        />

        {hits.length === 0 && !values[keys.schoolId] && <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />}
        <div>
          {manual && (
            <div>
              <Label>Nom de l'établissement</Label>
              <Field
                placeholder="Nom de l'établissement"
                className="form-control"
                validate={(v) => !v && requiredMessage}
                name={keys.schoolName}
                value={values[keys.schoolName]}
                onChange={handleChange}
              />
              <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />
            </div>
          )}
          {!manual && (
            <div style={{ display: hits.length > 0 || values[keys.schoolId] ? "block" : "none" }}>
              <Label>Nom de l'établissement</Label>
              <Field
                as="select"
                className="form-control"
                name={keys.schoolId}
                value={values[keys.schoolId]}
                validate={(v) => !v && requiredMessage}
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange({ target: { name: keys.schoolId, value } });
                  handleChange({ target: { name: keys.schoolName, value: hits.find((i) => i._id === value).fullName } });
                }}
              >
                <option key="" value="" disabled>
                  Sélectionner votre établissement scolaire
                </option>
                {hits?.map((hit) => (
                  <option key={hit._id} value={hit._id}>
                    {hit.fullName}
                  </option>
                ))}
                {hits.length === 0 && <option value={values[keys.schoolName]}>{values[keys.schoolName]}</option>}
              </Field>

              <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />
            </div>
          )}

          <div style={{ display: manual || hits.length > 0 || values[keys.schoolId] ? "block" : "none" }}>
            <Label>Niveau scolaire</Label>
            <Field
              as="select"
              className="form-control"
              name={keys.grade}
              value={values[keys.grade]}
              validate={(v) => !v && requiredMessage}
              onChange={(e) => {
                const value = e.target.value;
                handleChange({ target: { name: keys.grade, value } });
              }}
            >
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
          </div>
        </div>
        <div style={{ fontSize: "0.75rem", display: "flex", justifyContent: "flex-end", minHeight: "18px" }}>
          {showManualButton && (
            <span
              style={{ cursor: "pointer", color: "#007bff" }}
              onClick={() => {
                handleChange({ target: { name: keys.schoolName, value: "" } });
                handleChange({ target: { name: keys.schoolId, value: "" } });
                setManual(true);
              }}
            >
              Je n'ai pas trouvé pas mon établissement
            </span>
          )}
        </div>
      </Col>
    </Row>
  );
};

const Label = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
`;
