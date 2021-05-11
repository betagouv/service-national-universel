import React from "react";
import { Col } from "reactstrap";

import { translate } from "../../../utils";
import { Box, BoxContent, BoxTitle } from "../../../components/box";
import Historic from "../../../components/historic";

export default ({ young }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <div>
        <BoxTitle>{` Statut : ${translate(young.status)}`}</BoxTitle>
      </div>
      <BoxContent direction="column">{young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}</BoxContent>
    </Box>
  </Col>
);
