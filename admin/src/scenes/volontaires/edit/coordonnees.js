import React from "react";
import { Col } from "reactstrap";
import styled from "styled-components";

import { departmentList, regionList, department2region, departmentLookUp, colors } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Select from "../components/Select";

export default ({ values, handleChange, required = {}, errors, touched }) => {
  const [departmentAndRegionDisabled, setDepartmentAndRegionDisabled] = React.useState(true);

  const getDepartmentAndRegion = (zip) => {
    if (values.cohort === "2020") return;
    if (zip.length < 2) return;
    let departmentCode = zip.substr(0, 2);
    if (["97", "98"].includes(departmentCode)) {
      departmentCode = zip.substr(0, 3);
    }
    if (departmentCode === "20") {
      if (!["2A", "2B"].includes(departmentCode)) departmentCode = "2B";
    }
    handleChange({ target: { name: "department", value: departmentLookUp[departmentCode] } });
    handleChange({ target: { name: "region", value: department2region[departmentLookUp[departmentCode]] } });
  };

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Coordonnées</BoxHeadTitle>
        <BoxContent direction="column">
          <Item title="E-mail" values={values} name="email" handleChange={handleChange} required={required.email} errors={errors} touched={touched} />
          <Item title="Tél." values={values} name="phone" handleChange={handleChange} required={required.phone} errors={errors} touched={touched} />
          <Item title="Adresse" values={values} name="address" handleChange={handleChange} required={required.address} errors={errors} touched={touched} />
          <Item title="Ville" values={values} name="city" handleChange={handleChange} required={required.city} errors={errors} touched={touched} />
          <Item
            title="Code Postal"
            values={values}
            name="zip"
            handleChange={(event) => {
              const value = event.target.value;
              console.log(value);
              handleChange({ target: { value, name: "zip" } });
              getDepartmentAndRegion(value);
            }}
            required={required.zip}
            errors={errors}
            touched={touched}
          />
          <hr />

          {values.cohort === "2020" ? (
            <Info>
              <i>
                Les volontaires de la cohorte <b>2020</b> sont rattaché(e)s au département de leur établissement scolaire au jour de l'inscription. Il n'est pas modifié en fonction
                de leur adresse postale. Si vous voulez quand-même le modifier,{" "}
                <span className="link" onClick={() => setDepartmentAndRegionDisabled(false)}>
                  Cliquez-ici
                </span>
              </i>
            </Info>
          ) : (
            <Info>
              Le département et la région sont déduis du code postal renseigné ci-dessus. Si vous voulez quand-même le modifier,{" "}
              <span className="link" onClick={() => setDepartmentAndRegionDisabled(false)}>
                Cliquez-ici
              </span>
            </Info>
          )}
          <Select
            disabled={departmentAndRegionDisabled}
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
            disabled={departmentAndRegionDisabled}
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
};

const Info = styled.div`
  font-size: 0.8rem;
  color: ${colors.grey};
  .link {
    cursor: pointer;
    color: ${colors.purple};
    :hover {
      text-decoration: underline;
    }
  }
`;
