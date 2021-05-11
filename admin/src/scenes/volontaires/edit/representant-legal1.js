import React from "react";
import { Col } from "reactstrap";

import { departmentList, regionList } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxHeadTitle>Représentant Légal n°1</BoxHeadTitle>
      <BoxContent direction="column">
        <Select
          name="parent1Status"
          values={values}
          handleChange={handleChange}
          title="Statut"
          options={[
            { value: "mother", label: "Mère" },
            { value: "father", label: "Père" },
            { value: "representant", label: "Représentant légal" },
          ]}
        />
        <Item title="Prénom" values={values} name="parent1FirstName" handleChange={handleChange} />
        <Item title="Nom" values={values} name="parent1LastName" handleChange={handleChange} />
        <Item title="E-mail" values={values} name="parent1Email" handleChange={handleChange} />
        <Item title="Tél." values={values} name="parent1Phone" handleChange={handleChange} />
        <Select
          name="parent1OwnAddress"
          values={values}
          handleChange={handleChange}
          title="Adresse differente de celle du volontaire"
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
        <Item disabled={values.parent1OwnAddress !== "true"} title="Adresse" values={values} name="parent1Address" handleChange={handleChange} />
        <Item disabled={values.parent1OwnAddress !== "true"} title="Ville" values={values} name="parent1City" handleChange={handleChange} />
        <Item disabled={values.parent1OwnAddress !== "true"} title="Code Postal" values={values} name="parent1Zip" handleChange={handleChange} />
        <Select
          disabled={values.parent1OwnAddress !== "true"}
          name="parent1Department"
          values={values}
          handleChange={handleChange}
          title="Département"
          options={departmentList.map((d) => ({ value: d, label: d }))}
        />
        <Select
          disabled={values.parent1OwnAddress !== "true"}
          name="parent1Region"
          values={values}
          handleChange={handleChange}
          title="Région"
          options={regionList.map((r) => ({ value: r, label: r }))}
        />
      </BoxContent>
    </Box>
  </Col>
);
