import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col, Input } from "reactstrap";
import { Field } from "formik";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";

import api from "../../../services/api";
import SchoolCityTypeahead from "../../../components/SchoolCityTypeahead";

export default ({ handleChange, values, keys, errors, touched }) => {
  const [hits, setHits] = useState([]);

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
    });
    setHits(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    return hits;
  };

  useEffect(() => {
    (async () => {
      if (values[keys.schoolId]) {
        const { responses } = await api.esQuery("school", {
          query: { ids: { values: [values[keys.schoolId]] } },
        });
        setHits(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
        return hits;
      }
    })();
  }, [values[keys.schoolId]]);

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  return (
    <Row>
      <Col md={12} style={{ marginTop: 15 }}>
        <SchoolCityTypeahead
          onChange={(e) => {
            handleChange({ target: { name: keys.schoolId, value: "" } });
            getSuggestions(e);
          }}
        />
        {hits.length === 0 && !values[keys.schoolId] && <ErrorMessage errors={errors} touched={touched} name={keys.schoolName} />}
        <div style={{ display: hits.length > 0 || values[keys.schoolId] ? "block" : "none" }}>
          <Field
            style={{ marginTop: "1rem" }}
            as="select"
            className="form-control"
            name={keys.schoolId}
            value={values[keys.schoolId]}
            validate={(v) => !v && requiredMessage}
            onChange={(e) => {
              const value = e.target.value;
              handleChange({ target: { name: keys.schoolId, value } });
            }}
          >
            <option key="" value="" disabled>
              Sélectionner votre établissement scolaire
            </option>
            {hits?.map((hit) => (
              <option key={hit._id} value={hit._id}>
                {`${hit.fullName}, ${hit.postcode} ${hit.city}`}
              </option>
            ))}
            {hits.length === 0 && <option value={values[keys.schoolName]}>{values[keys.schoolName]}</option>}
          </Field>
          <ErrorMessage errors={errors} touched={touched} name={keys.schoolId} />
          <Field
            style={{ marginTop: "1rem" }}
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
      </Col>
    </Row>
  );
};
