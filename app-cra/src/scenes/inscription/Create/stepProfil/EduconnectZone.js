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
            <div className="flex justify-center lg:justify-between flex-wrap gap-y-2">
              <div className="flex flex-wrap items-center justify-center gap-x-4">
                <NouveauBadge />
                <div className="text-center">
                  <span className="inline-flex items-center justify-center">
                    Inscription avec ÉduConnect
                    <a className="pl-1" href="https://educonnect.education.gouv.fr/educt-aide/informations/">
                      <InfoIcon />
                    </a>
                  </span>
                  <p className="text-center text-gray-500 text-xs font-weight-light">Un compte unique pour les services numériques des écoles et des établissements.</p>
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
