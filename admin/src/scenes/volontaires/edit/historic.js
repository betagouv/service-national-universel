import React from "react";
import { Col } from "reactstrap";

import { translate, getLabelWithdrawnReason } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Historic from "../../../components/historic";
import { Info } from "../../../components/Panel";

export default function HistoricView({ young }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <div>
          <BoxHeadTitle>{` Statut : ${translate(young.status)}`}</BoxHeadTitle>
        </div>
        <BoxContent direction="column">
          {young && young.withdrawnReason && young.withdrawnMessage !== 0 && (
            <Info title="Motif du désistement">
              {young.withdrawnReason ? <div className="quote">{getLabelWithdrawnReason(young.withdrawnReason)}</div> : null}
              <div className="quote">{young.withdrawnMessage ? `« ${young.withdrawnMessage} »` : "Non renseigné"}</div>
            </Info>
          )}
          {young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}
        </BoxContent>
      </Box>
    </Col>
  );
}
