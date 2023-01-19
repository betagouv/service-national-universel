import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import Avatar from "../../../components/Avatar";
import Badge from "../../../components/Badge";
import { Box, BoxTitle } from "../../../components/box";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { Title } from "../../../components/commons";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalReferentDeleted from "../../../components/modals/ModalReferentDeleted";
import SocialIcons from "../../../components/SocialIcons";
import api from "../../../services/api";
import { canDeleteReferent, copyToClipboard, ES_NO_LIMIT, htmlCleaner, ROLES, translate } from "../../../utils";
import Button from "../../missions/components/Button";
import DeleteBtnComponent from "../components/DeleteBtnComponent";
import Invite from "../components/invite";
import Menu from "../components/Menu";
import StructureView from "./wrapper";
import Field from "../../centersV2/components/Field";
import EditButton from "../components/EditButton";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import Informations from "../components/Informations";
import CardContacts from "../components/cards/CardContacts";

export default function DetailsView({ structure }) {
  // const [referents, setReferents] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });
  const [parentStructure, setParentStructure] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  const onClickDelete = (target) => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(target),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${target.firstName} ${target.lastName} ?`,
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

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  // const getReferents = async () => {
  //   if (!structure) return;
  //   const { responses: referentResponses } = await api.esQuery("referent", {
  //     query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
  //     size: ES_NO_LIMIT,
  //   });
  //   if (structure.networkId) {
  //     const { responses: structureResponses } = await api.esQuery("structure", { query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: structure.networkId } }] } } });

  //     if (structureResponses.length) {
  //       const structures = structureResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
  //       setParentStructure(structures.length ? structures[0] : null);
  //     }
  //   } else {
  //     setParentStructure(null);
  //   }
  //   if (referentResponses.length) {
  //     setReferents(referentResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
  //   }
  // };

  const getReferents = async () => {
    if (!structure) return;
    const { responses } = await api.esQuery("referent", {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
      size: ES_NO_LIMIT,
    });
    if (responses.length) return responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
  };

  const createReferent = async (referentData) => {
    try {
      const { ok, code, data } = await api.post(`/referent`, referentData);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return data;
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la création du profil :", translate(e.code));
    }
  };

  const deleteReferent = async (target) => {
    try {
      const { ok, code } = await api.remove(`/referent/${target._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(target);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la suppression du profil :", translate(e.code));
    }
  };

  if (!structure) return <div />;

  return (
    <>
      <header className="flex items-center justify-between mx-8 my-6">
        <Title>{structure.name}</Title>
        <Button>Nouvelle mission</Button>
      </header>
      <Menu id={structure._id} />
      <section className="flex mx-8 gap-4">
        <div className="bg-white rounded-lg overflow-hidden px-4 py-2 shadow-lg">Représentant de la structure</div>
        <CardContacts getContacts={getReferents} createContact={createReferent} deleteContact={deleteReferent} />
      </section>
      <Informations structure={structure} />
    </>

    // <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
    //   <StructureView structure={structure} tab="details">
    //     <Box>
    //       <Row>
    //         <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
    //           <Bloc title="La structure" titleRight={<SocialIcons value={structure} />}>
    //             <Details title="Présentation" value={structure.description} />
    //             <Details title="Statut Juridique" value={translate(structure.legalStatus)} />
    //             <Details title="Type" value={structure.types?.map(translate)?.join(", ")} />
    //             <Details title="Sous-type" value={translate(structure.sousType)} />
    //             <Details title="Adresse" value={structure.address} />
    //             <Details title="Ville" value={structure.city} />
    //             <Details title="Code Postal" value={structure.zip} />
    //             <Details title="Dép." value={structure.department} />
    //             <Details title="Région" value={structure.region} />
    //             {user.role === ROLES.ADMIN && structure.location?.lat && structure.location?.lon ? (
    //               <Details title="GPS" value={`${structure.location?.lat} , ${structure.location?.lon}`} copy />
    //             ) : null}
    //             <Details title="Siret" value={structure.siret} />
    //             {parentStructure ? (
    //               <div className="detail">
    //                 <div className="detail-title">Réseau national&nbsp;:</div>
    //                 <div className="detail-text">
    //                   <Badge text={parentStructure.name} color="#5245cc" />
    //                 </div>
    //               </div>
    //             ) : null}
    //             <Details
    //               title="Tête de réseau"
    //               value={structure.isNetwork === "true" ? "Cette structure est une tête de réseau" : "Cette structure n'est pas une tête de réseau"}
    //             />
    //           </Bloc>
    //         </Col>
    //         <Col md={6}>
    //           <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
    //             <Wrapper>
    //               <BoxTitle>{`Équipe (${referents.length})`}</BoxTitle>
    //               {referents.length ? null : <i>Aucun compte n&apos;est associé à cette structure.</i>}
    //               {referents.map((referent) => (
    //                 <div className="flex items-center justify-between mt-4" key={referent._id}>
    //                   <Link to={`/user/${referent._id}`} className="flex items-center">
    //                     <Avatar name={`${referent.firstName} ${referent.lastName}`} />
    //                     <div className="pr-10">{`${referent.firstName} ${referent.lastName}`}</div>
    //                   </Link>
    //                   {referents.length > 1 && canDeleteReferent({ actor: user, originalTarget: referent, structure }) && (
    //                     <DeleteBtnComponent onClick={() => onClickDelete(referent)}></DeleteBtnComponent>
    //                   )}
    //                 </div>
    //               ))}
    //               <ModalConfirm
    //                 isOpen={modal?.isOpen}
    //                 title={modal?.title}
    //                 message={modal?.message}
    //                 onCancel={() => setModal({ isOpen: false, onConfirm: null })}
    //                 onConfirm={() => {
    //                   modal?.onConfirm();
    //                   setModal({ isOpen: false, onConfirm: null });
    //                 }}
    //               />
    //             </Wrapper>
    //           </Row>
    //           <Invite structure={structure} onSent={getReferents} />
    //         </Col>
    //       </Row>
    //     </Box>
    //   </StructureView>
    //   <ModalChangeTutor
    //     isOpen={modalTutor?.isOpen}
    //     title={modalTutor?.title}
    //     message={modalTutor?.message}
    //     tutor={modalTutor?.value}
    //     onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
    //     onConfirm={() => {
    //       modalTutor?.onConfirm();
    //       setModalTutor({ isOpen: false, onConfirm: null });
    //     }}
    //   />
    //   <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => setModalReferentDeleted({ isOpen: false })} />
    // </div>
  );
}

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled }) => {
  return (
    <Row
      style={{
        width: "100%",
        borderTop: borderTop ? "2px solid #f4f5f7" : 0,
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}>
      <Wrapper
        style={{
          width: "100%",
        }}>
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, copy }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text" dangerouslySetInnerHTML={{ __html: htmlCleaner(value) }} />
      {copy ? (
        <div
          className="icon"
          onClick={() => {
            copyToClipboard(value);
            toastr.success(`'${title}' a été copié dans le presse papier.`);
          }}
        />
      ) : null}
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
      white-space: pre-line;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
    width: 15px;
    height: 15px;
    background: ${`url(${require("../../../assets/copy.svg")})`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15px 15px;
  }
`;
