import React from "react";
import { Col } from "reactstrap";
import InfoIcon from "../../../../assets/InfoIcon2";
import NouveauBadge from "../../../../assets/NouveauBadge";
import EduConnectButton from "../../../../components/buttons/EduConnectButton";
import FormRow from "../../../../components/form/FormRow";

export function EduconnectZone({ connected }) {
  return (
    <div className="px-4">
      <FormRow>
        <Col>
          {!connected ? (
            <div className="flex justify-between flex-wrap gap-y-2">
              <div className="flex items-center gap-4">
                <NouveauBadge />
                <div>
                  <span className="inline-flex">
                    Inscription avec ÉduConnect
                    <a className="pl-1 flex items-center" href="https://educonnect.education.gouv.fr/educt-aide/informations/">
                      <InfoIcon />
                    </a>
                  </span>
                  <p className="text-gray-500 text-xs font-weight-light">Un compte unique pour les services numériques des écoles et des établissements.</p>
                </div>
              </div>
              <EduConnectButton />
            </div>
          ) : (
            <i>Les informations en provenance de ÉduConnect ont bien été enregistrées.</i>
          )}
        </Col>
      </FormRow>
    </div>
  );
}
