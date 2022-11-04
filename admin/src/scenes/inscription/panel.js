import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";

import { formatDateFR } from "snu-lib";
import Badge from "../../components/Badge";
import DownloadButton from "../../components/buttons/DownloadButton";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Historic from "../../components/historic";
import ModalConfirm from "../../components/modals/ModalConfirm";
import Panel, { Details, Info } from "../../components/Panel";
import PatchHistoric from "../../components/views/PatchHistoric";
import { appURL } from "../../config";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { formatPhoneNumberFR, getAge, isInRuralArea, translate as t, YOUNG_STATUS } from "../../utils";

export default function InscriptionPanel({ onChange, value }) {
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = value && value._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [value]);

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
      if (!ok) return toastr.error("Une erreur s'est produite :", t(code));
      toastr.success("Ce volontaire a été supprimé.");
      onChange();
      history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", t(e.code));
    }
  };

  if (!value) return <div />;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  function isFromFranceConnect() {
    return young && young.parent1FromFranceConnect === "true" && (!young.parent2Status || young.parent2FromFranceConnect === "true");
  }

  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <div className="close" onClick={onChange} />
          <div className="title">{value.firstName ? `${value.firstName} ${value.lastName}` : "Compte supprimé"}</div>
        </div>
        <div>
          <Badge text={value.cohort} />
        </div>
        <div>{t(value.gender)}</div>
        {value.birthdateAt && (
          <div>
            Né(e) le {formatDate(value.birthdateAt)} • {getAge(value.birthdateAt)} ans
          </div>
        )}
        {value.birthCity && value.birthCountry ? (
          <div>
            à {value.birthZip} {value.birthCity}, {value.birthCountry}
          </div>
        ) : null}
        {value.frenchNationality === "true" ? <div style={{ fontStyle: "italic", fontSize: "0.9rem" }}>🇫🇷 Nationalité française</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <Link to={`/volontaire/${value._id}`} onClick={() => plausibleEvent("Inscriptions/CTA - Consulter profil jeune")}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          <Link to={`/volontaire/${value._id}/edit`} onClick={() => plausibleEvent("Inscriptions/CTA - Modifier profil jeune")}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${value._id}`} onClick={() => plausibleEvent("Inscriptions/CTA - Prendre sa place")}>
            <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
          </a>
          <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
        </div>
        {value.status === YOUNG_STATUS.WITHDRAWN && <div className="mt-3">⚠️ Désistement : &quot;{value.withdrawnMessage}&quot;</div>}
      </div>
      {[YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(value.status) && value.inscriptionCorrectionMessage ? (
        <Info title="Demande(s) de correction :" id={value._id}>
          <PatchHistoric value={value} model="young" field="inscriptionCorrectionMessage" previewNumber={1} />
        </Info>
      ) : null}
      {value.status === YOUNG_STATUS.REFUSED && value.inscriptionRefusedMessage ? (
        <Info title="Motif de refus :" id={value._id}>
          {value.inscriptionRefusedMessage}
        </Info>
      ) : null}
      {young?.historic?.length > 0 && (
        <Info title="Historique des statuts" id={value._id}>
          <Historic value={young.historic} />
        </Info>
      )}
      <Info title="Pièce d’identité" id={value._id}>
        {(young?.files.cniFiles || []).map((e, i) => (
          <DownloadButton
            key={i}
            source={() => api.get(`/young/${value._id}/documents/cniFiles/${e._id}`)}
            title={`Télécharger la pièce d’identité (${i + 1}/${young.files.cniFiles.length})`}
          />
        ))}
        {young?.latestCNIFileExpirationDate ? (
          <div className="mt-1">
            <b>Date d&apos;expiration :</b> {formatDateFR(young.latestCNIFileExpirationDate)}{" "}
          </div>
        ) : null}
      </Info>
      <Info title="Coordonnées" id={value._id}>
        <Details title="E-mail" value={value.email} copy />
        <Details title="Tel" value={formatPhoneNumberFR(value.phone)} />
        <Details title="Région" value={value.region} />
        <Details title="Dép" value={value.department} />
        <Details title="Ville" value={value.city && value.zip && `${value.city} (${value.zip})`} />
        <Details title="Adresse" value={value.address} />
      </Info>
      <Info title="Situation" id={value._id}>
        <Details title="Statut" value={t(value.situation)} />
        <Details title="Classe" value={t(value.grade)} />
        <Details title="Type" value={value.schoolType} />
        <Details title="Nom" value={value.schoolName} />
        <Details title="Adresse" value={value.schoolAddress} />
        <Details title="Ville" value={value.schoolCity && value.schoolZip && `${value.schoolCity} (${value.schoolZip})`} />
        <Details title="Dép" value={value.schoolDepartment} />
        <Details title="Région" value={value.schoolRegion} />
      </Info>
      <Info title="Situations particulières" id={value._id}>
        <Details title="Quartier Prioritaire de la Ville" value={t(value.qpv)} />
        <Details title="Zone Rurale" value={t(isInRuralArea(value))} />
        <Details title="Handicap" value={t(value.handicap)} />
        <Details title="Allergies ou intolérances" value={t(value.allergies)} />
        <Details title="PPS" value={t(value.ppsBeneficiary)} />
        <Details title="PAI" value={t(value.paiBeneficiary)} />
        <Details title="Suivi médicosocial" value={t(value.medicosocialStructure)} />
        <Details title="Aménagement spécifique" value={t(value.specificAmenagment) || "Non"} />
        <Details title="Aménagement pour mobilité réduite" value={t(value.reducedMobilityAccess) || "Non"} />
        <Details title="Affecté dans son département de résidence" value={t(value.handicapInSameDepartment) || "Non"} />
        <Details title="Activités de haut niveau" value={t(value.highSkilledActivity)} />
      </Info>
      <Info title="Représentant légal n°1" id={value._id}>
        <Details title="Statut" value={t(value.parent1Status)} />
        <Details title="Prénom" value={value.parent1FirstName} />
        <Details title="Nom" value={value.parent1LastName} />
        <Details title="E-mail" value={value.parent1Email} />
        <Details title="Tel" value={formatPhoneNumberFR(value.parent1Phone)} />
        <Details title="Adresse" value={value.parent1Address} />
        <Details title="Ville" value={value.parent1City && value.parent1Zip && `${value.parent1City} (${value.parent1Zip})`} />
        <Details title="Dép" value={value.parent1Department} />
        <Details title="Région" value={value.parent1Region} />
      </Info>
      {value.parent2Status && (
        <Info title="Représentant légal n°2" id={value._id}>
          <Details title="Statut" value={t(value.parent2Status)} />
          <Details title="Prénom" value={value.parent2FirstName} />
          <Details title="Nom" value={value.parent2LastName} />
          <Details title="E-mail" value={value.parent2Email} />
          <Details title="Tel" value={formatPhoneNumberFR(value.parent2Phone)} />
          <Details title="Adresse" value={value.parent2Address} />
          <Details title="Ville" value={value.parent2City && value.parent2Zip && `${value.parent2City} (${value.parent2Zip})`} />
          <Details title="Dép" value={value.parent2Department} />
          <Details title="Région" value={value.parent2Region} />
        </Info>
      )}
      {value.motivations && (
        <div className="info">
          <div className="info-title">Motivations</div>
          <div className="quote">{`« ${value.motivations} »`}</div>
        </div>
      )}
      {/* <div>
        {Object.keys(value).map((e) => {
          return <div>{`${e}:${value[e]}`}</div>;
        })}
      </div> */}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={async () => {
          await modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </Panel>
  );
}
