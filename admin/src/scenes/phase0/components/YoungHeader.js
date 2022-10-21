import React, { useState } from "react";
import Title from "../../../components/views/Title";
import {canViewEmailHistory, ROLES} from "../../../utils";
import Badge from "../../../components/Badge";
import TabList from "../../../components/views/TabList";
import Tab from "./Tab";
import { appURL } from "../../../config";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { useSelector } from "react-redux";
import Pencil from "../../../assets/icons/Pencil";
import History from "../../../assets/icons/History";
import Field from "./Field";
import { translate } from "snu-lib";
import { Button } from "./Buttons";
import Bin from "../../../assets/Bin";
import TakePlace from "../../../assets/icons/TakePlace";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import {toastr} from "react-redux-toastr";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import IconChangementCohorte from "../../../assets/IconChangementCohorte";
import Chevron from "../../../components/Chevron";

export default function YoungHeader({ young, tab, onChange }) {
  const user = useSelector((state) => state.Auth.user);
  const [notesCount, setNotesCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  function onClickDelete() {
    setConfirmModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: "Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?",
      message: "Cette action est irréversible.",
    });
  }

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.put(`/young/${young._id}/soft-delete`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push("/inscription");
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };

  return (
    <div className="px-[30px] pt-[15px] flex items-end border-b-[#E5E7EB] border-b-[1px]">
      <div className="grow">
        <Title>
          <div className="mr-[15px]">
            {young.firstName} {young.lastName}
          </div>
          <Badge color="#66A7F4" backgroundColor="#F9FCFF" text={young.cohort} />
          <EditCohortButton cohort={young.cohort} />
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
          <Field name="status" label="Inscription" value={translate(young.status)} />
          <div className="flex items-center justify-between my-[15px]">
            <Button icon={<Bin fill="red" />} onClick={onClickDelete}>
              Supprimer
            </Button>
            <Button
              className="ml-[8px]"
              icon={<TakePlace className="text-[#6B7280]" />}
              href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}
              onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              Prendre sa place
            </Button>
          </div>
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
      <ModalConfirm
        isOpen={confirmModal?.isOpen}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onCancel={() => setConfirmModal({ isOpen: false })}
        onConfirm={() => {
          confirmModal?.onConfirm();
          setConfirmModal({ isOpen: false });
        }}
      />
    </div>
  );
}

function EditCohortButton({ cohort }) {
  const user = useSelector((state) => state.Auth.user);
  const options = ["à venir"];
  const disabled = ![ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);

  return (
    <>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button" disabled={disabled}>
          <div className="flex items-center justify-center p-[9px] rounded-[4px] cursor-pointer border-[1px] border-[transparent] hover:border-[#E5E7EB] mr-[15px]">
            <Pencil stroke="#66A7F4" className="w-[11px] h-[11px]" />
          </div>
        </DropdownToggle>
        <DropdownMenu>
          {options
            .filter((e) => e !== cohort)
            .map((status) => {
              return (
                <DropdownItem key={status} className="dropdown-item" onClick={() => onClick(status)}>
                  Cohorte {status}
                </DropdownItem>
              );
            })}
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
}
