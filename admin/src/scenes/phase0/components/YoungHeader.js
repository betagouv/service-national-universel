import React, { useState } from "react";
import Title from "../../../components/views/Title";
import {canViewEmailHistory, YOUNG_STATUS} from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "./Tab";
import {Col, Row} from "reactstrap";
import SelectStatus from "../../../components/selectStatus";
import {appURL} from "../../../config";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import Pencil from "../../../assets/icons/Pencil";
import History from "../../../assets/icons/History";

export default function YoungHeader({ young, tab, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [notesCount, setNotesCount] = useState(0);

  function onClickDelete() {

  }
  return (
    <div className="px-[30px] pt-[15px] flex items-end border-b-[#E5E7EB] border-b-[1px]">
      <div className="grow">
        <Title>
          <div className="mr-[15px]">
            {young.firstName} {young.lastName}
          </div>
          <Badge color="#66A7F4" backgroundColor="#F9FCFF" text={young.cohort} />
          <div className="flex items-center justify-center p-[9px] rounded-[4px] cursor-pointer border-[1px] border-[transparent] hover:border-[#E5E7EB] mr-[15px]">
            <Pencil stroke="#66A7F4" className="w-[11px] h-[11px]" />
          </div>
          {young.originalCohort && (
            <Badge color="#9A9A9A" backgroundColor="#F6F6F6" text={young.originalCohort} tooltipText={`Anciennement ${young.originalCohort}`} style={{ cursor: "default" }} />
          )}
        </Title>
        <TabList className="mt-[30px]">
          <Tab isActive={tab === "file"} onClick={() => history.push(`/volontaire/${young._id}`)}>
            Dossier d&apos;inscription
          </Tab>
          <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
            <div className="flex items-center">
              <History className="block flex-[0_0_18px] mr-[8px]" fill="#9CA3AF" />
              Historique
            </div>
          </Tab>
          {canViewEmailHistory(user) ? (
            <Tab isActive={tab === "notifications"} disabled onClick={() => history.push(`/volontaire/${young._id}/notifications`)}>
              Notifications
            </Tab>
          ) : null}
          <Tab isActive={tab === "notes"} onClick={() => history.push(`/volontaire/${young._id}/notes`)}>
            ({notesCount}) Notes internes
          </Tab>
        </TabList>
      </div>
      <div className="ml-[30px]">
        <div className="">

        </div>
      </div>
      {/*<Row style={{ minWidth: "30%" }}>
        <Col md={12}>
          <Row>
            <Col md={12} style={{ display: "flex", justifyContent: "flex-end" }}>
              <SelectStatus hit={young} options={[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN]} />
            </Col>
          </Row>
          {young.status !== YOUNG_STATUS.DELETED ? (
            <>
              <Row style={{ marginTop: "0.5rem" }}>
                <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
                  <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
                </a>
                <Link to={`/volontaire/${young._id}/edit`} onClick={() => plausibleEvent("Volontaires/CTA - Modifier profil volontaire")}>
                  <PanelActionButton icon="pencil" title="Modifier" />
                </Link>
                <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
              </Row>
            </>
          ) : null}
        </Col>
      </Row>*/}
    </div>
  )
}
