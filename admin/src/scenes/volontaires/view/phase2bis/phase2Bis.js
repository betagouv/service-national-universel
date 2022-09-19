import React from "react";
import { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Box, BoxTitle } from "../../../../components/box";
import DownloadAttestationButton from "../../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../../components/buttons/MailAttestationButton";
import SelectStatus from "../../../../components/selectStatus";
import api from "../../../../services/api";
import { colors, ENABLE_PM, translate as t, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "../../../../utils";
import CardEquivalence from "../../components/Equivalence";
import Toolbox from "../../components/Toolbox";
import Phase2militaryPrepartionV2 from "../phase2MilitaryPreparationV2";
import WrapperPhase2 from "../wrapper";
import ApplicationList2 from "./applicationList2";
import GrayListIcon from "../../../../assets/listIconGray.svg";
import BorderBottom from "../../../../assets/borderBottom.svg";
import SettingIconGray from "../../../../assets/settingsPhase2Gray.svg";
import BlueListIcon from "../../../../assets/listIconBlue.svg";
import BlueSettingIcon from "../../../../assets/settingsPhase2Blue.svg";
import Preferences from "./preferences";
// import Pencil from "../../../../assets/modifyIcon.svg";

export default function Phase2({ young, onChange }) {
  const [equivalences, setEquivalences] = React.useState([]);
  const [settingPage, setSettingPage] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2" onChange={onChange}>
        <Box>
          <Row>
            <Col md={4} sm={4} style={{ padding: "3rem", borderRight: "2px solid #f4f5f7" }}>
              <BoxTitle>Réalisation des 84 heures de mission d&apos;intérêt général</BoxTitle>
              <p style={{ flex: 1 }}>
                Le volontaire doit réaliser sa phase 2 dans l&apos;année suivant son séjour de cohésion.
                <br />
                Pour plus d&apos;informations,{" "}
                <a
                  className="underline hover:underline"
                  href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
                  target="_blank"
                  rel="noreferrer">
                  cliquez-ici
                </a>
                .
              </p>
            </Col>
            <Col md={4} sm={4} style={{ padding: 0, borderRight: "2px solid #f4f5f7" }}>
              <Row
                style={{
                  height: "50%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "1rem",
                  margin: 0,
                  borderBottom: "2px solid #f4f5f7",
                }}>
                <HourTitle>Heures de MIG prévisionnelles</HourTitle>
                <HourDetail>{young.phase2NumberHoursEstimated || "0"}h</HourDetail>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <HourTitle>Heures de MIG réalisées</HourTitle>
                <HourDetail>{young.phase2NumberHoursDone || "0"}h sur 84h</HourDetail>
              </Row>
            </Col>
            <Col md={4} sm={4} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SelectStatus
                hit={young}
                statusName="statusPhase2"
                phase={YOUNG_PHASE.INTEREST_MISSION}
                options={Object.keys(YOUNG_STATUS_PHASE2).filter((e) => e !== YOUNG_STATUS_PHASE2.WITHDRAWN)}
              />
            </Col>
          </Row>
        </Box>
        {ENABLE_PM ? <Phase2militaryPrepartionV2 young={young} /> : null}
        {equivalences.map((equivalence, index) => (
          <CardEquivalence key={index} equivalence={equivalence} young={young} />
        ))}

        <Toolbox young={young} />
        <Box>
          <div className="flex">
            {!settingPage ? (
              <>
                <div className="ml-8 py-4 flex ">
                  <img src={BlueListIcon} />
                  <div className="text-sm text-blue-600 font-medium ml-2">Missions candidatées</div>
                </div>
                <div className="ml-8 py-4 flex ">
                  <img src={SettingIconGray} />
                  <div
                    className="text-sm text-gray-500 font-medium ml-2 cursor-pointer"
                    onClick={() => {
                      setSettingPage(true);
                    }}>
                    Préférences
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between w-full px-4 items-center">
                  <div className="flex">
                    <div className="ml-8 py-4 flex">
                      <img src={GrayListIcon} />
                      <div
                        className="text-sm text-gray-500 font-medium ml-2 cursor-pointer"
                        onClick={() => {
                          setSettingPage(false);
                        }}>
                        Missions candidatées
                      </div>
                    </div>
                    <div className="ml-8 py-4 flex ">
                      <img src={BlueSettingIcon} />
                      <div className="text-sm text-blue-600 font-medium ml-2">Préférences</div>
                    </div>
                  </div>
                  {/* <div className="bg-blue-100 rounded-[28px] px-[9px] py-[7px] flex items-center h-[32px] space-x-2 ">
                    <img src={Pencil} />
                    <div className="text-blue-600 text-xs font-medium cursor-pointer">Modifier</div>
                  </div> */}
                </div>
              </>
            )}
          </div>

          <div className="mb-4">
            <img className="w-full" src={BorderBottom} alt="" />
          </div>
          {!settingPage ? <ApplicationList2 young={young} onChangeApplication={onChange} /> : <Preferences young={young} />}
        </Box>

        {young.statusPhase2 === "VALIDATED" ? (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center" }}>
              <DownloadAttestationButton young={young} uri="2">
                Télécharger l&apos;attestation de réalisation de la phase 2
              </DownloadAttestationButton>
              <MailAttestationButton style={{ marginTop: ".5rem" }} young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                Envoyer l&apos;attestation par mail
              </MailAttestationButton>
            </div>
          </div>
        ) : null}
      </WrapperPhase2>
    </div>
  );
}

const HourTitle = styled.div`
  text-transform: uppercase;
  color: ${colors.grey};
  font-size: 0.8rem;
`;
const HourDetail = styled.div`
  font-size: 1.2rem;
`;
