import React from "react";
import { Col } from "reactstrap";

import { departmentList, regionList } from "../../../utils";
import { Box, BoxContent, BoxTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange, required = {}, errors, touched }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Coordonnées</BoxTitle>
      <BoxContent direction="column">
        <Item title="E-mail" values={values} name="email" handleChange={handleChange} required={required.email} errors={errors} touched={touched} />
        <Item title="Tél." values={values} name="phone" handleChange={handleChange} required={required.phone} errors={errors} touched={touched} />
        <Item title="Adresse" values={values} name="address" handleChange={handleChange} required={required.address} errors={errors} touched={touched} />
        <Item title="Ville" values={values} name="city" handleChange={handleChange} required={required.city} errors={errors} touched={touched} />
        <Item title="Code Postal" values={values} name="zip" handleChange={handleChange} required={required.zip} errors={errors} touched={touched} />
        <Select
          name="department"
          values={values}
          handleChange={handleChange}
          title="Département"
          options={departmentList.map((d) => ({ value: d, label: d }))}
          required={required.department}
          errors={errors}
          touched={touched}
        />
        <Select
          name="region"
          values={values}
          handleChange={handleChange}
          title="Région"
          options={regionList.map((r) => ({ value: r, label: r }))}
          required={required.region}
          errors={errors}
          touched={touched}
        />
      </BoxContent>
    </Box>
  </Col>
);
