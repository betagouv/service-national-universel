import React from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";

import { departmentList, regionList, YOUNG_SITUATIONS, translate } from "../../../utils";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxTitle>Situation</BoxTitle>
        <BoxContent direction="column">
          <Select
            disabled={user.role !== "admin"}
            title="Statut"
            values={values}
            name="situation"
            handleChange={handleChange}
            options={Object.keys(YOUNG_SITUATIONS).map((s) => ({ value: s, label: translate(s) }))}
          />
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
};
