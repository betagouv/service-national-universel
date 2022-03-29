import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";

import {
  YOUNG_SITUATIONS,
  translate as t,
  YOUNG_STATUS,
  isInRuralArea,
  getAge,
  formatDateFRTimezoneUTC,
  formatStringLongDate,
  getLabelWithdrawnReason,
  ROLES,
  colors,
  translate,
} from "../../utils";
import { appURL } from "../../config";
import api from "../../services/api";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import Historic from "../../components/historic";
import ContractLink from "../../components/ContractLink";
import plausibleEvent from "../../services/pausible";
import ModalConfirm from "../../components/modals/ModalConfirm";
import { toastr } from "react-redux-toastr";

export default function VolontairePanel({ onChange, value }) {
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  const [young, setYoung] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: "Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.put(`/young/${young._id}/soft-delete`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      onChange();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };

  useEffect(() => {
    (async () => {
      const id = value && value._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [value]);
  useEffect(() => {
    if (!young) return;
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
      setReferentManagerPhase2(null);
    })();
    return () => setReferentManagerPhase2();
  }, [young]);

  if (!value || !young) return <div />;

  return (
    <>
      <Panel>
        <div className="info">
          <div style={{ display: "flex" }}>
            <div className="close" onClick={onChange} />
            <div className="title">{young.firstName ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}</div>
          </div>
          <div>{t(young.gender)}</div>
          {young.birthdateAt && (
            <div>
              Né(e) le {formatDateFRTimezoneUTC(young.birthdateAt)} • {getAge(young.birthdateAt)} ans
            </div>
          )}
          {young.birthCity && young.birthCountry ? (
            <div>
              à {young.birthZip} {young.birthCity}, {young.birthCountry}
            </div>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/volontaire/${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <Link to={`/volontaire/${young._id}/edit`} onClick={() => plausibleEvent("Volontaires/CTA - Modifier profil volontaire")}>
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
            <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            </a>
            <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
          </div>
          <Details title="Vu(e) le" value={formatStringLongDate(young.lastLoginAt)} />
          <Link to={`/user?DEPARTMENT=%5B"${young.department}"%5D&ROLE=%5B"${ROLES.REFERENT_DEPARTMENT}"%5D`}>
            <TextButton>Voir équipe de référents ({young.department}) ›</TextButton>
          </Link>
        </div>
        {young.status === YOUNG_STATUS.WITHDRAWN ? (
          <Info title="Motif du désistement">
            {young.withdrawnReason ? <div className="quote">{getLabelWithdrawnReason(young.withdrawnReason)}</div> : null}
            <div className="quote">{young.withdrawnMessage ? `« ${young.withdrawnMessage} »` : "Non renseigné"}</div>
          </Info>
        ) : null}
        <Info title="Recherche de MIG" id={young._id}>
          {young.applications.length ? (
            <>
              {young.applications.length &&
                young.applications
                  .sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0))
                  .map((a, i) => <ApplicationDetails key={a._id} application={a} i={i + 1} />)}
              <Link to={`/volontaire/${young._id}/phase2`}>
                <TextButton>Voir toutes ses candidatures ›</TextButton>
              </Link>
            </>
          ) : (
            <NoResult>Aucune candidature n&apos;est liée à ce volontaire.</NoResult>
          )}
          <Details title="Contact phase 2" value={referentManagerPhase2?.email || (referentManagerPhase2 !== undefined && "Non trouvé") || "Chargement..."} copy />
        </Info>
        <Info title="Coordonnées" id={young._id}>
          <Details title="E-mail" value={young.email} copy />
          <Details title="Tel" value={young.phone} />
          <Details title="Adresse" value={young.address} />
          <Details title="Ville" value={young.city && young.zip && `${young.city} (${young.zip})`} />
          <Details title="Dép" value={young.department} />
          <Details title="Région" value={young.region} />
        </Info>
        <Info title="Situation" id={young._id}>
          <Details
            title="Statut"
            value={() => {
              if (young.situation === YOUNG_SITUATIONS.GENERAL_SCHOOL) return "En enseignement général ou technologique";
              if (young.situation === YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL) return "En enseignement professionnel";
              if (young.situation === YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL) return "En lycée agricole";
              if (young.situation === YOUNG_SITUATIONS.SPECIALIZED_SCHOOL) return "En établissement spécialisé";
              if (young.situation === YOUNG_SITUATIONS.APPRENTICESHIP) return "En apprentissage";
              if (young.situation === YOUNG_SITUATIONS.EMPLOYEE) return "Salarié(e)";
              if (young.situation === YOUNG_SITUATIONS.INDEPENDANT) return "Indépendant(e)";
              if (young.situation === YOUNG_SITUATIONS.SELF_EMPLOYED) return "Auto-entrepreneur";
              if (young.situation === YOUNG_SITUATIONS.ADAPTED_COMPANY) return "En ESAT, CAT ou en entreprise adaptée";
              if (young.situation === YOUNG_SITUATIONS.POLE_EMPLOI) return "Inscrit(e) à Pôle emploi";
              if (young.situation === YOUNG_SITUATIONS.MISSION_LOCALE) return "Inscrit(e) à la Mission locale";
              if (young.situation === YOUNG_SITUATIONS.CAP_EMPLOI) return "Inscrit(e) à Cap emploi";
              if (young.situation === YOUNG_SITUATIONS.NOTHING) return "Inscrit(e) nulle part";
            }}
          />
          <Details title="Classe" value={young.grade} />
          <Details title="Type" value={young.schoolType} />
          <Details title="Nom" value={young.schoolName} />
          <Details title="Région" value={young.schoolRegion} />
          <Details title="Dép" value={young.schoolDepartment} />
          <Details title="Ville" value={young.schoolCity && young.schoolZip && `${young.schoolCity} (${young.schoolZip})`} />
          <Details title="Adresse" value={young.schoolAdress} />
        </Info>
        <Info title="Situations particulières" id={young._id}>
          <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
          <Details title="Zone Rurale" value={t(isInRuralArea(young))} />
          <Details title="Handicap" value={t(young.handicap)} />
          <Details title="Allergies" value={t(young.allergies)} />
          <Details title="PPS" value={t(young.ppsBeneficiary)} />
          <Details title="PAI" value={t(young.paiBeneficiary)} />
          <Details title="Suivi médicosocial" value={t(young.medicosocialStructure)} />
          <Details title="Aménagement spécifique" value={t(young.specificAmenagment) || "Non"} />
          <Details title="Aménagement pour mobilité réduite" value={t(young.reducedMobilityAccess) || "Non"} />
          <Details title="Affecté dans son département de résidence" value={t(young.handicapInSameDepartment) || "Non"} />
          <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
          <Details title="Affecté dans son département de résidence (activité de haut niveau)" value={t(young.highSkilledActivityInSameDepartment) || "Non"} />
        </Info>
        {young.parent1Status && (
          <Info title="Représentant légal n°1" id={young._id}>
            <Details title="Statut" value={t(young.parent1Status)} />
            <Details title="Prénom" value={young.parent1FirstName} />
            <Details title="Nom" value={young.parent1LastName} />
            <Details title="E-mail" value={young.parent1Email} />
            <Details title="Tel" value={young.parent1Phone} />
            <Details title="Adresse" value={young.parent1Address} />
            <Details title="Ville" value={young.parent1City && young.parent1Zip && `${young.parent1City} (${young.parent1Zip})`} />
            <Details title="Dép" value={young.parent1Department} />
            <Details title="Région" value={young.parent1Region} />
          </Info>
        )}
        {young.parent2Status && (
          <Info title="Représentant légal n°2" id={young._id}>
            <Details title="Statut" value={t(young.parent2Status)} />
            <Details title="Prénom" value={young.parent2FirstName} />
            <Details title="Nom" value={young.parent2LastName} />
            <Details title="E-mail" value={young.parent2Email} />
            <Details title="Tel" value={young.parent2Phone} />
            <Details title="Adresse" value={young.parent2Address} />
            <Details title="Ville" value={young.parent2City && young.parent2Zip && `${young.parent2City} (${young.parent2Zip})`} />
            <Details title="Dép" value={young.parent2Department} />
            <Details title="Région" value={young.parent2Region} />
          </Info>
        )}
        <div className="info">{young?.historic?.length > 0 && <Historic value={young.historic} />}</div>
        {young.motivations && (
          <div className="info">
            <div className="info-title">Motivations</div>
            <div className="quote">{`« ${young.motivations} »`}</div>
          </div>
        )}
      </Panel>
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
    </>
  );
}

const ApplicationDetails = ({ application, i }) => {
  const history = useHistory();

  if (!application) return <div />;
  return (
    <div className="application-detail">
      <div className="application-detail-text">
        <Link to={`/structure/${application.structureId}`}>
          <span className="application-detail-priority">{`# ${i}`}</span>
          <span className="application-detail-priority">{application.structure?.name}</span>
        </Link>
        <Link to={`/mission/${application.missionId}`}>
          <br />
          {application.missionName}
        </Link>
      </div>
      {["VALIDATED", "IN_PROGRESS", "DONE", "ABANDON"].includes(application.status) ? (
        <ContractLink
          style={{ margin: 0 }}
          onClick={() => {
            history.push(`/volontaire/${application.youngId}/phase2/application/${application._id}/contrat`);
          }}>
          Contrat d&apos;engagement &gt;
        </ContractLink>
      ) : null}
    </div>
  );
};

const NoResult = styled.div`
  text-align: center;
  font-style: italic;
  margin: 1rem;
`;

const TextButton = styled.div`
  margin: 0.5rem;
  text-align: center;
  color: ${colors.purple};
  :hover {
    cursor: pointer;
    color: ${colors.purple};
    text-decoration: underline;
  }
`;
