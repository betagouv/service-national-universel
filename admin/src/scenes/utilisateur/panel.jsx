import Img6 from "../../assets/link.svg";
import Img5 from "../../assets/copy.svg";
import Img4 from "../../assets/close_icon.png";
import Img3 from "../../assets/pencil.svg";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate, ROLES, copyToClipboard, canDeleteReferent, formatPhoneNumberFR, department2region } from "../../utils";
import { canSigninAs } from "snu-lib";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import { Info, Details } from "../../components/Panel";
import styled from "styled-components";
import ModalConfirm from "../../components/modals/ModalConfirm";
import plausibleEvent from "../../services/plausible";
import ModalChangeTutor from "../../components/modals/ModalChangeTutor";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";
import ModalUniqueResponsable from "./composants/ModalUniqueResponsable";
import PanelV2 from "../../components/PanelV2";
import { signinAs } from "@/utils/signinAs";

export default function UserPanel({ onChange, value }) {
  const [structure, setStructure] = useState();
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalUniqueResponsable, setModalUniqueResponsable] = useState({ isOpen: false });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const missionCount = structure?.missions?.length || 0;
  const placesLeft = structure?.missions?.reduce((acc, e) => acc + e.placesLeft, 0);

  useEffect(() => {
    (async () => {
      if (!value?.structureId) return;
      const { ok, data, code } = await api.get(`/structure/${value.structureId}?withMissions=true&withTeam=true&withReferents=true`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
      return setStructure(data);
    })();
  }, [value]);

  const handleImpersonate = async () => {
    try {
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const data = await signinAs("referent", value._id);
      dispatch(setUser(data));
      history.push("/dashboard");
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: `Êtes-vous sûr(e) de vouloir supprimer le compte de ${value.firstName} ${value.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onUniqueResponsible = (target) => {
    setModalUniqueResponsable({
      isOpen: true,
      responsable: target,
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${value._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_STRUCTURE") return onUniqueResponsible(value);
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(value);
      if (!ok && code === "LINKED_CLASSES") return onUniqueResponsible(value);
      if (!ok && code === "LINKED_ETABLISSEMENT") return onUniqueResponsible(value);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  if (!value) return <div />;
  return (
    <PanelV2 open={value ? true : false} onClose={onChange} title={`${value.firstName} ${value.lastName}`}>
      <Panel>
        <div className="info">
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/user/${value._id}`}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            {canSigninAs(user, value, "referent") ? <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" /> : null}
            {canDeleteReferent({ actor: user, originalTarget: value, structure }) ? <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" /> : null}
            {structure ? (
              <Link to={`/structure/${structure._id}`} onClick={() => plausibleEvent("Utilisateurs/Profil CTA - Voir structure")}>
                <PanelActionButton icon="eye" title="Voir la structure" />
              </Link>
            ) : null}
          </div>
        </div>
        <Info title="Coordonnées">
          <Details title="E-mail" value={value.email} copy />
        </Info>
        <Info title="Informations">
          <Details title="Rôle" value={translate(value.role)} />
          <Details title="Fonction" value={translate(value.subRole)} />
          {value.role === ROLES.REFERENT_DEPARTMENT ? (
            value.department.map((v, i) => <Details key={i} title="Département" value={`${v} (${department2region[v]})`} />)
          ) : (
            <Details title="Région" value={value.region} />
          )}
          <Details title="Tel fixe" value={formatPhoneNumberFR(value.phone)} />
          <Details title="Tel Mobile" value={formatPhoneNumberFR(value.mobile)} />
        </Info>
        {structure ? (
          <React.Fragment>
            <Info title="Structure">
              <div className="detail">
                <div className="detail-title">Nom :</div>
                <div style={{ display: "flex" }}>
                  <div className="detail-text">{structure.name}</div>
                  <Link to={`/structure/${structure._id}`}>
                    <IconLink />
                  </Link>
                </div>
              </div>
              <Details title="Région" value={structure?.region} />
              <Details title="Dép." value={structure?.department} />
              <div className="detail" style={{ alignItems: "flex-start" }}>
                <div className="detail-title">Référents Dép. :</div>
                {!structure.referents?.length ? (
                  <div className="detail-text">Aucun référent trouvé</div>
                ) : (
                  <div className="detail-text">
                    <ul>
                      {structure.referents.map((referent) => (
                        <li key={referent._id} style={{ display: "flex", alignItems: "center" }}>
                          {referent.email}
                          <IconCopy
                            onClick={() => {
                              copyToClipboard(referent.email);
                              toastr.success(`'${referent.email}' a été copié dans le presse papier.`);
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="detail" style={{ alignItems: "flex-start" }}>
                <div className="detail-title">Équipe :</div>
                {!structure?.team?.length ? (
                  <div className="detail-text">Aucun compte trouvé</div>
                ) : (
                  <div className="detail-text">
                    <ul>
                      {structure.team.map((member) => (
                        <TeamMember key={member._id}>
                          {`${member.firstName} ${member.lastName}`}
                          <Link to={`/user/${member._id}`}>
                            <IconLink />
                          </Link>
                        </TeamMember>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Details title="Missions dispo." value={missionCount} />
              <Details title="Places restantes" value={placesLeft} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px" }}>
                {missionCount > 0 ? (
                  <Link to={`/structure/${structure._id}/missions`}>
                    <Button className="btn-missions">Consulter toutes les missions</Button>
                  </Link>
                ) : null}
              </div>
            </Info>
          </React.Fragment>
        ) : null}
        {value?.role === ROLES.HEAD_CENTER && <Sessions user={value} />}
        <ModalConfirm
          isOpen={modal?.isOpen}
          title={modal?.title}
          message={modal?.message}
          onCancel={() => setModal({ isOpen: false, onConfirm: null })}
          onConfirm={() => {
            modal?.onConfirm();
            setModal({ isOpen: false, onConfirm: null });
          }}
        />
        <ModalChangeTutor
          isOpen={modalTutor?.isOpen}
          title={modalTutor?.title}
          message={modalTutor?.message}
          tutor={modalTutor?.value}
          onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
          onConfirm={() => {
            modalTutor?.onConfirm();
            setModalTutor({ isOpen: false, onConfirm: null });
          }}
        />
        <ModalUniqueResponsable
          isOpen={modalUniqueResponsable?.isOpen}
          responsable={modalUniqueResponsable?.responsable}
          onConfirm={() => setModalUniqueResponsable({ isOpen: false })}
        />
        <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.go(0)} />
      </Panel>
    </PanelV2>
  );
}

const Button = styled.button`
  margin: 0 0.5rem;
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  min-width: 100px;
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-missions {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    font-size: 14px;
    padding: 5px 15px;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;

const IconLink = styled.div`
  margin: 0 0.5rem;
  width: 18px;
  height: 18px;
  background: ${`url(${Img6})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
`;

const IconCopy = styled.div`
  cursor: pointer;
  margin: 0 0.5rem;
  width: 15px;
  height: 15px;
  background: ${`url(${Img5})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
`;

const TeamMember = styled.li`
  display: flex;
  align-items: center;
`;

function Sessions({ user }) {
  const [sessions, setSessions] = useState([]);
  async function getSessions(user) {
    const { ok, data } = await api.get(`/referent/${user?._id}/session-phase1`);
    if (!ok) return toastr.error("Une erreur est survenue lors de la récupération des sessions");
    return setSessions(data);
  }

  useEffect(() => {
    getSessions(user);
  }, [user]);

  if (!sessions.length) return null;

  return (
    <Info title="Centres">
      <div className="mt-2 space-y-4">
        {sessions.map((e) => {
          return (
            <div key={e._id} className="space-y-2">
              <p className="font-semibold">{e.nameCentre}</p>
              <p className="w-fit rounded-full border-[1px] border-blue-500 bg-blue-50 px-3 py-1 text-xs text-blue-500">{e.cohort}</p>
            </div>
          );
        })}
      </div>
    </Info>
  );
}

const Panel = styled.div`
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${Img4}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  .title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 2px;
  }
  hr {
    margin: 20px 0 30px;
  }
  .info {
    padding: 2rem 0;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${Img3}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    padding: 5px 0;
    display: flex;
    font-size: 14px;
    text-align: left;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 10px;
    &-title {
      font-weight: bold;
      min-width: 100px;
      margin-right: 0.5rem;
    }
    &-text {
      text-align: left;
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    .description {
      font-weight: 400;
      color: #aaa;
      font-size: 0.8rem;
    }
    .quote {
      font-size: 0.9rem;
      font-weight: 400;
      font-style: italic;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
  .application-detail {
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin-bottom: 0.5rem;
    text-align: left;
    :hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
      background: #f9f9f9;
    }
    &-priority {
      font-size: 0.75rem;
      color: #5245cc;
      margin-right: 0.5rem;
    }
    &-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
    }
  }
  .quote {
    font-size: 0.9rem;
    font-weight: 400;
    font-style: italic;
  }
`;
