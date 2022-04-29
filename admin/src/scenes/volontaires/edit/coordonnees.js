import React, { useEffect } from "react";
import { Col } from "reactstrap";
import styled from "styled-components";

import { departmentList, regionList, department2region, departmentLookUp, colors, departmentToAcademy } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Select from "../components/Select";
import AddressInput from "../../../components/addressInputV2";

export default function Coordonnees({ values, handleChange, required = {}, errors, touched, validateField }) {
  const [departmentAndRegionDisabled, setDepartmentAndRegionDisabled] = React.useState(true);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Adresse</BoxHeadTitle>
        <BoxContent direction="column">
          <AddressInput
            keys={{
              country: "country",
              city: "city",
              zip: "zip",
              address: "address",
              location: "location",
              department: "department",
              region: "region",
              addressVerified: "addressVerified",
            }}
            values={values}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
            validateField={validateField}
          />
          <hr />

          {values.cohort === "2020" ? (
            <Info>
              <i>
                Les volontaires de la cohorte <b>2020</b> sont rattaché(e)s au département de leur établissement scolaire au jour de l&apos;inscription. Il n&apos;est pas modifié
                en fonction de leur adresse postale. Si vous voulez quand-même le modifier,{" "}
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
}

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
