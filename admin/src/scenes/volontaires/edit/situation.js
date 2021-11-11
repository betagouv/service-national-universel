import React from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";

import { departmentList, regionList, YOUNG_SITUATIONS, translate, ROLES } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange, required = {}, errors, touched }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Situation</BoxHeadTitle>
        <BoxContent direction="column">
          <Select
            disabled={user.role !== ROLES.ADMIN && values._id}
            title="Statut"
            values={values}
            name="situation"
            handleChange={handleChange}
            options={Object.keys(YOUNG_SITUATIONS).map((s) => ({ value: s, label: translate(s) }))}
            required={required.situation}
            errors={errors}
            touched={touched}
          />
          <Select
            title="Classe"
            values={values}
            name="grade"
            handleChange={handleChange}
            options={[
              { label: "3ème", value: "3eme" },
              { label: "2nd", value: "2nd" },
              { label: "1ère", value: "1ere" },
              { label: "1ère année CAP", value: "1ere CAP" },
              { label: "Terminale", value: "Terminale" },
              { label: "Terminale CAP", value: "Terminale CAP" },
              { label: "SEGPA", value: "SEGPA" },
              { label: "Classe relais", value: "Classe relais" },
              { label: "Autre", value: "Autre" },
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
