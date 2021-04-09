import React from "react";
import { Col } from "reactstrap";

import { departmentList, regionList } from "../../../utils";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Situation</BoxTitle>
      <BoxContent direction="column">
        <Item disabled title="Statut" values={values} name="situation" handleChange={handleChange} />
        <Select
          title="Classe"
          values={values}
          name="grade"
          handleChange={handleChange}
          options={[
            { value: "3eme", label: "3eme" },
            { value: "2nde", label: "2nde" },
            { value: "1ere", label: "1ere" },
            { value: "Terminale", label: "Terminale" },
          ]}
        />
        <Item title="Type" values={values} name="schoolType" handleChange={handleChange} />
        <Item title="Nom" values={values} name="schoolName" handleChange={handleChange} />
        <Item title="Adresse" values={values} name="schoolAddress" handleChange={handleChange} />
        <Item title="Ville" values={values} name="schoolCity" handleChange={handleChange} />
        <Item title="Code Postal" values={values} name="schoolZip" handleChange={handleChange} />
        <Select name="schoolDepartment" values={values} handleChange={handleChange} title="Département" options={departmentList.map((d) => ({ value: d, label: d }))} />
        <Select name="schoolRegion" values={values} handleChange={handleChange} title="Région" options={regionList.map((r) => ({ value: r, label: r }))} />
      </BoxContent>
    </Box>
  </Col>
);
