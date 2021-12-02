import React from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";
import Etablissement from "./components/etablissmentInput";

export default function Situation({ values, handleChange, required = {}, errors, touched, setFieldValue }) {
  const user = useSelector((state) => state.Auth.user);
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Situation</BoxHeadTitle>
        <BoxContent direction="column">
          <Etablissement
            setFieldValue={setFieldValue}
            values={values}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
            required={required}
            keys={{
              schoolName: "schoolName",
              grade: "grade",
              schoolId: "schoolId",
              schoolCountry: "schoolCountry",
              schoolCity: "schoolCity",
            }}
          />
        </BoxContent>
      </Box>
    </Col>
  );
}
