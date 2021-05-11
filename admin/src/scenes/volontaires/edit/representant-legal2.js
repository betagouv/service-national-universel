import React from "react";
import { Col } from "reactstrap";

import { departmentList, regionList } from "../../../utils";
import { Box, BoxContent, BoxTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Représentant Légal n°2</BoxTitle>
      <BoxContent direction="column">
        <Select
          name="parent2Status"
          values={values}
          handleChange={handleChange}
          title="Statut"
          options={[
            { value: "mother", label: "Mère" },
            { value: "father", label: "Père" },
            { value: "representant", label: "Représentant légal" },
          ]}
        />
        <Item title="Prénom" values={values} name="parent2FirstName" handleChange={handleChange} />
        <Item title="Nom" values={values} name="parent2LastName" handleChange={handleChange} />
        <Item title="E-mail" values={values} name="parent2Email" handleChange={handleChange} />
        <Item title="Tél." values={values} name="parent2Phone" handleChange={handleChange} />
        <Select
          name="parent2OwnAddress"
          values={values}
          handleChange={handleChange}
          title="Adresse differente de celle du volontaire"
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
        <Item disabled={values.parent2OwnAddress !== "true"} title="Adresse" values={values} name="parent2Address" handleChange={handleChange} />
        <Item disabled={values.parent2OwnAddress !== "true"} title="Ville" values={values} name="parent2City" handleChange={handleChange} />
        <Item disabled={values.parent2OwnAddress !== "true"} title="Code Postal" values={values} name="parent2Zip" handleChange={handleChange} />
        <Select
          disabled={values.parent2OwnAddress !== "true"}
          name="parent2Department"
          values={values}
          handleChange={handleChange}
          title="Département"
          options={departmentList.map((d) => ({ value: d, label: d }))}
        />
        <Select
          disabled={values.parent2OwnAddress !== "true"}
          name="parent2Region"
          values={values}
          handleChange={handleChange}
          title="Région"
          options={regionList.map((r) => ({ value: r, label: r }))}
        />
      </BoxContent>
    </Box>
  </Col>
);
