import React from "react";
import { Col } from "reactstrap";

import { departmentList, regionList } from "../../../utils";
import Box from "../components/Box";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange, required = {}, errors, touched }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Coordonnées</BoxTitle>
      <BoxContent direction="column">
        <Item title="E-mail" values={values} name="email" handleChange={handleChange} required={required.email} errors={errors} touched={touched} />
        <Item title="Tél." values={values} name="phone" handleChange={handleChange} />
        <Item title="Adresse" values={values} name="address" handleChange={handleChange} />
        <Item title="Ville" values={values} name="city" handleChange={handleChange} />
        <Item title="Code Postal" values={values} name="zip" handleChange={handleChange} />
        <Select name="department" values={values} handleChange={handleChange} title="Département" options={departmentList.map((d) => ({ value: d, label: d }))} />
        <Select name="region" values={values} handleChange={handleChange} title="Région" options={regionList.map((r) => ({ value: r, label: r }))} />
      </BoxContent>
    </Box>
  </Col>
);
