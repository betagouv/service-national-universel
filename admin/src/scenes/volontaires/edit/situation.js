import React from "react";
import { Col } from "reactstrap";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Etablissement from "./components/etablissmentInput";

export default function Situation({ values, handleChange, required = {}, errors, touched, setFieldValue }) {
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
