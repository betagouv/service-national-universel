import React from "react";
import { Col } from "reactstrap";

import { translate, getLabelWithdrawnReason, YOUNG_STATUS } from "../../../utils";
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
          {young.status === YOUNG_STATUS.WITHDRAWN && (young.withdrawnMessage || young.withdrawnReason) && (
            <Info>
              {young.withdrawnReason ? (
                <div className="quote">
                  <b>{getLabelWithdrawnReason(young.withdrawnReason)}</b>
                </div>
              ) : null}
              <div className="quote">
                <i>Précision : {young.withdrawnMessage ? `« ${young.withdrawnMessage} »` : "Non renseigné"}</i>
              </div>
            </Info>
          )}
          {young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}
        </BoxContent>
      </Box>
    </Col>
  );
}
