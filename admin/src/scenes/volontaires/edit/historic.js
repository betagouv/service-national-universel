import React from "react";
import { Col } from "reactstrap";

import { translate } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Historic from "../../../components/historic";

export default function HistoricView({ young }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <div>
          <BoxHeadTitle>{` Statut : ${translate(young.status)}`}</BoxHeadTitle>
        </div>
        <BoxContent direction="column">{young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}</BoxContent>
      </Box>
    </Col>
  );
}
