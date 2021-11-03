import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col, Input } from "reactstrap";
import { Field } from "formik";

import api from "../../../services/api";

export default ({ handleChange, values, keys }) => {
  const [hits, setHits] = useState([]);

  const getSuggestions = async (text) => {
    const { responses } = await api.esQuery("school", { query: { multi_match: { query: text, type: "most_fields", fields: "city" } } });
    setHits(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    return hits;
  };

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  return (
    <Row>
      <Col md={12} style={{ marginTop: 15 }}>
        <Input style={{ maxWidth: 500 }} name="schoolType" placeholder="Commencez à taper la ville de l'établissement..." onChange={(event) => {
          getSuggestions(event.target.value);
        }} />
        <Field
          style={{ marginTop: "1rem" }}
          as="select"
          className="form-control"
          placeholder="Sélectionnez votre établissement"
          name={keys.schoolName}
          value={values[keys.schoolName] || "Sélectionnez votre établissement"}
          onChange={(e) => {
            const value = e.target.value;
            handleChange({ target: { name: keys.schoolName, value } });
          }}
        >
          {hits?.map((hit) => (
            <option key={hit._id} value={hit.name2}>
              {`${hit.name2}, ${hit.postcode} ${hit.city}`}
            </option>
          ))}
        </Field>
        <Field
          style={{ marginTop: "1rem" }}
          as="select"
          className="form-control"
          placeholder="Sélectionnez votre classe"
          name={keys.schoolRank}
          value={values[keys.schoolRank]}
          onChange={(e) => {
            const value = e.target.value;
            handleChange({ target: { name: keys.schoolRank, value } });
          }}
        >
          {["Seconde", "1ère", "Terminale"].map((rank) => (
            <option key={rank} value={rank}>
              {`${rank}`}
            </option>
          ))}
        </Field>
      </Col>
    </Row>
  );
};
