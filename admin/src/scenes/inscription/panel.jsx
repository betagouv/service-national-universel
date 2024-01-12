import Img3 from "../../assets/close_icon.png";
import Img2 from "../../assets/pencil.svg";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import { formatDateFR } from "snu-lib";
import Badge from "../../components/Badge";
import DownloadButton from "../../components/buttons/DownloadButton";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Historic from "../../components/historic";
import ModalConfirmDeleteYoung from "../../components/modals/young/ModalConfirmDeleteYoung";
import { Details, Info } from "../../components/Panel";
import PatchHistoric from "../../components/views/PatchHistoric";
import { appURL } from "../../config";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { formatPhoneNumberFR, getAge, isInRuralArea, translate as t, YOUNG_STATUS } from "../../utils";
import styled from "styled-components";
import PanelV2 from "../../components/PanelV2";
import { toastr } from "react-redux-toastr";

export default function InscriptionPanel({ onChange, value }) {
  const [young, setYoung] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = value && value._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [value]);

  const handleDeleteYoung = () => {
    setIsConfirmDeleteModalOpen(true);
  };

  const handleCancelDeleteYoung = () => {
    setIsConfirmDeleteModalOpen(false);
  };

  const handleDeleteYoungSuccess = () => {
    setIsConfirmDeleteModalOpen(false);
    onChange();
    history.go(0);
  };

  if (!value || !young) return <div />;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  const onPrendreLaPlace = async (young_id) => {
    plausibleEvent("Volontaires/CTA - Prendre sa place");
    const { ok } = await api.post(`/referent/signin_as/young/${young_id}`);
    if (!ok) return toastr.error("Une erreur s'est produite lors de la prise de place du volontaire.");
  };

  return (
    <>
      <PanelV2
        open={value && young ? (isConfirmDeleteModalOpen ? false : true) : false}
        onClose={onChange}
        title={young.firstName ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}>
        <Panel>
          <div className="info">
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
              <button
                onClick={() => {
                  window.open(appURL, "_blank");
                  onPrendreLaPlace(value._id);
                }}>
                <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
              </button>
              <PanelActionButton onClick={handleDeleteYoung} icon="bin" title="Supprimer" />
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
        </Panel>
      </PanelV2>
      <ModalConfirmDeleteYoung isOpen={isConfirmDeleteModalOpen} young={young} onCancel={handleCancelDeleteYoung} onConfirm={handleDeleteYoungSuccess} />
    </>
  );
}

const Panel = styled.div`
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${Img3}) center no-repeat;
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
      background: url(${Img2}) center no-repeat;
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
