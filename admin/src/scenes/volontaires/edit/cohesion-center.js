import React, { useState, useEffect } from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import AssignCenter from "../components/AssignCenter";
import { canAssignCohesionCenter, translate } from "../../../utils";
import api from "../../../services/api";

export default function CohesionCenter({ values, handleChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [cohesionCenter, setCohesionCenter] = useState();

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get(`/session-phase1/${values.sessionPhase1Id}/cohesion-center`);
        setCohesionCenter(response.data);
      } catch (e) {
        console.log(e);
        toastr.error("Oups, une erreur est survenue :", translate(e.code));
      }
    })();
  }, [values.sessionPhase1Id]);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Centre de cohésion</BoxHeadTitle>
        <BoxContent direction="column">
          {canAssignCohesionCenter(user) && (
            <AssignCenter young={values} onAffect={(session, young) => handleChange({ target: { value: young.sessionPhase1Id, name: "sessionPhase1Id" } })} />
          )}
          {cohesionCenter ? (
            <>
              <Item disabled title="Centre de cohésion" values={cohesionCenter} name="name" handleChange={handleChange} />
              <Item disabled title="Code postal centre de cohésion" values={cohesionCenter} name="zip" handleChange={handleChange} />
              <Item disabled title="Ville centre de cohésion" values={cohesionCenter} name="city" handleChange={handleChange} />
            </>
          ) : null}
        </BoxContent>
      </Box>
    </Col>
  );
}
