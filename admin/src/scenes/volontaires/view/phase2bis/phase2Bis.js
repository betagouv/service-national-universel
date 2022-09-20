import React from "react";
import { useState } from "react";
import { Col, Row } from "reactstrap";
import { Box, BoxTitle } from "../../../../components/box";
import DownloadAttestationButton from "../../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../../components/buttons/MailAttestationButton";
import SelectStatus from "../../../../components/selectStatus";
import api from "../../../../services/api";
import { ENABLE_PM, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "../../../../utils";
import CardEquivalence from "../../components/Equivalence";
import Toolbox from "../../components/Toolbox";
import Phase2militaryPrepartionV2 from "../phase2MilitaryPreparationV2";
import WrapperPhase2 from "../wrapper";
import ApplicationList2 from "./applicationList2";
import Preferences from "./preferences";
// import Pencil from "../../../../assets/pencil.svg";
import { HiOutlineAdjustments } from "react-icons/hi";
import Menu from "../../../../assets/icons/Menu";

export default function Phase2({ young, onChange }) {
  const [equivalences, setEquivalences] = React.useState([]);
  const [blocOpened, setBlocOpened] = useState("missions");

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
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG prévisionnelles</div>
                <div className="font-bold text-2xl text-[#242526]">{young.phase2NumberHoursEstimated || "0"}h</div>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG réalisées</div>
                <div className="font-bold text-2xl text-[#242526]">{young.phase2NumberHoursDone || "0"}h sur 84h</div>
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
          <div className="flex border-b-[1px] border-b-gray-200 ">
            {blocOpened === "missions" && (
              <>
                <div className="ml-8 py-4 flex border-b-[2px] border-b-blue-500 items-center">
                  <Menu className="text-blue-600 " />
                  <div className="text-sm text-blue-600 font-medium ml-2">Missions candidatées</div>
                </div>
                <div className="ml-8 py-4 flex ">
                  <HiOutlineAdjustments className=" w-5 h-5 text-gray-300 " />
                  <div
                    className="text-sm text-gray-500 font-medium ml-2 cursor-pointer"
                    onClick={() => {
                      setBlocOpened("preferences");
                    }}>
                    Préférences de missions
                  </div>
                </div>
              </>
            )}
            {blocOpened === "preferences" && (
              <>
                <div className="ml-8 py-4 flex items-center">
                  <Menu className="text-gray-300 " />
                  <div
                    className="text-sm text-gray-500 font-medium ml-2 cursor-pointer"
                    onClick={() => {
                      setBlocOpened("missions");
                    }}>
                    Missions candidatées
                  </div>
                </div>
                <div className="ml-8 py-4 flex border-b-[2px] border-b-blue-500">
                  <HiOutlineAdjustments className=" w-5 h-5 text-blue-600 " />
                  <div className="text-sm text-blue-600 font-medium ml-2 ">Préférences de missions</div>
                </div>

                {/* A rajouter prochain ticket */}
                {/* <div className="bg-blue-100 rounded-[28px] px-[9px] py-[7px] flex items-center h-[32px] space-x-2 ">
                    <img src={Pencil} />
                    <div className="text-blue-600 text-xs font-medium cursor-pointer">Modifier</div>
                  </div> */}
              </>
            )}
          </div>
          {blocOpened === "missions" && <ApplicationList2 young={young} onChangeApplication={onChange} />}
          {blocOpened === "preferences" && <Preferences young={young} />}
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
