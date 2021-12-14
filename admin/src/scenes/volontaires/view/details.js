import React from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate as t, isInRuralArea, ROLES, copyToClipboard, formatStringDate, getAge, YOUNG_STATUS, getLabelWithdrawnReason, colors } from "../../../utils";
import YoungView from "./wrapper";
import api from "../../../services/api";
import DownloadButton from "../../../components/buttons/DownloadButton";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import { Box, BoxTitle } from "../../../components/box";
import Emails from "../../../components/views/Emails";
import InfoIcon from "../../../assets/InfoIcon";
import TickDone from "../../../assets/TickDone";
import Copy from "../../../assets/Copy";
import PatchHistoric from "../../../components/views/PatchHistoric";
import ExpandComponent from "../../../components/ExpandComponent";

const youngConsentmentText = (
  <ul>
    <li>A lu et accepte les Conditions générales d&apos;utilisation de la plateforme du Service national universel ;</li>
    <li>A pris connaissance des modalités de traitement de mes données personnelles ;</li>
    <li>
      Est volontaire, sous le contrôle des représentants légaux, pour effectuer la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion
      puis la réalisation d&apos;une mission d&apos;intérêt général ;
    </li>
    <li>Certifie l&apos;exactitude des renseignements fournis ;</li>
    <li>
      Si en terminale, a bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai pas
      participer au séjour de cohésion entre le 3 et le 15 juillet 2022 (il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des épreuves).
    </li>
  </ul>
);

const parentsConsentmentText = (
  <ul>
    <li>Confirmation d&apos;être titulaire de l&apos;autorité parentale / le représentant légal du volontaire ;</li>
    <li>
      Autorisation du volontaire à participer à la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d&apos;une
      mission d&apos;intérêt général ;
    </li>
    <li>Engagement à renseigner le consentement relatif aux droits à l&apos;image avant le début du séjour de cohésion ;</li>
    <li>Engagement à renseigner l&apos;utilisation d&apos;autotest COVID avant le début du séjour de cohésion ;</li>
    <li>
      Engagement à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires à son arrivée au centre de séjour de cohésion ;
    </li>
    <li>
      Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c&apos;est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires
      résidents de Guyane, la fièvre jaune.
    </li>
  </ul>
);

export default function VolontaireViewDetails({ young }) {
  const user = useSelector((state) => state.Auth.user);

  function isFromFranceConnect() {
    return young.parent1FromFranceConnect === "true" && (!young.parent2Status || young.parent2FromFranceConnect === "true");
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <YoungView young={young} tab="details">
        {young.status === YOUNG_STATUS.REFUSED && young.inscriptionRefusedMessage ? (
          <Box>
            <Bloc title="Motif de refus" id={young._id}>
              {young.inscriptionRefusedMessage}
            </Bloc>
          </Box>
        ) : null}
        {young.status === YOUNG_STATUS.WAITING_CORRECTION && young.inscriptionCorrectionMessage ? (
          <Box>
            <Bloc title="Message de demande de correction :" id={young._id}>
              <PatchHistoric value={young} model="young" field="inscriptionCorrectionMessage" previewNumber={1} />
            </Bloc>
          </Box>
        ) : null}
        {young.status === YOUNG_STATUS.WITHDRAWN && (young.withdrawnMessage || young.withdrawnReason) ? (
          <Box>
            <Bloc title="Désistement">
              {young.withdrawnReason ? <div className="quote">{getLabelWithdrawnReason(young.withdrawnReason)}</div> : null}
              <div className="quote">Précision : {young.withdrawnMessage ? `« ${young.withdrawnMessage} »` : "Non renseigné"}</div>
            </Bloc>
          </Box>
        ) : null}
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Bloc title="Informations générales">
                <Details title="E-mail" value={young.email} copy />
                <Details title="Date de naissance" value={`${formatStringDate(young.birthdateAt)} • ${getAge(young.birthdateAt)} ans`} />
                <Details title="Lieu de naissance" value={young.birthCity} />
                <Details title="Pays de naissance" value={young.birthCountry} />
                {young.frenchNationality === "true" ? <Details title="Nationalité" value="🇫🇷 Nationalité française" /> : null}
                <Details title="Sexe" value={t(young.gender)} />
                <Details title="Tel" value={young.phone} />
                <Details title="Adresse" value={young.address} />
                <Details title="Ville" value={young.city} />
                <Details title="Code Postal" value={young.zip} />
                <Details title="Dép" value={young.department} />
                <Details title="Région" value={young.region} />
                <Details title="Académie" value={young.academy} />
                {young.foreignAddress && (
                  <Infos>
                    <InfoIcon color="#32257F" />
                    <p>
                      Le volontaire réside à l&apos;étranger :
                      <br />
                      {[young.foreignAddress, young.foreignZip, young.foreignCity].join(", ")}
                      <br />
                      {young.foreignCountry}
                    </p>
                  </Infos>
                )}
                {user.role === ROLES.ADMIN && young.location?.lat && young.location?.lon ? (
                  <Details title="GPS" value={`${young.location?.lat} , ${young.location?.lon}`} copy />
                ) : null}
                {(young.cniFiles || []).map((e, i) => (
                  <DownloadButton
                    key={i}
                    source={() => api.get(`/referent/youngFile/${young._id}/cniFiles/${e}`)}
                    title={`Télécharger la pièce d’identité (${i + 1}/${young.cniFiles.length})`}
                  />
                ))}
              </Bloc>
              <Bloc title="Situations particulières">
                <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
                <Details title="Zone Rurale" value={t(isInRuralArea(young))} />
                <Details title="Handicap" value={t(young.handicap)} />
                <Details title="Allergies" value={t(young.allergies)} />
                <Details title="PPS" value={t(young.ppsBeneficiary)} />
                <Details title="PAI" value={t(young.paiBeneficiary)} />
                <Details title="Suivi médicosocial" value={t(young.medicosocialStructure)} />
                <Details title="Aménagement spécifique" value={t(young.specificAmenagment) || "Non"} />
                <Details title="A besoin d'un aménagement pour mobilité réduite" value={t(young.reducedMobilityAccess) || "Non"} />
                <Details title="Doit être affecté dans son département de résidence" value={t(young.handicapInSameDepartment) || "Non"} />
                <Details title="Doit être affecté dans son département de résidence (activité de haut niveau)" value={t(young.highSkilledActivityInSameDepartment) || "Non"} />
                <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
                {(young.highSkilledActivityProofFiles || []).map((e, i) => (
                  <DownloadButton
                    key={i}
                    source={() => api.get(`/referent/youngFile/${young._id}/highSkilledActivityProofFiles/${e}`)}
                    title={`Télécharger la pièce jusitificative (${i + 1}/${young.highSkilledActivityProofFiles.length})`}
                  />
                ))}
              </Bloc>
              <Bloc title="Droit à l'image">
                <Details title="Autorisation" value={t(young.imageRight)} />
                {(young.imageRightFiles || []).map((e, i) => (
                  <DownloadButton
                    key={i}
                    source={() => api.get(`/referent/youngFile/${young._id}/imageRightFiles/${e}`)}
                    title={`Télécharger le formulaire (${i + 1}/${young.imageRightFiles.length})`}
                  />
                ))}
              </Bloc>
              {getAge(young?.birthdateAt) < 15 ? (
                <Bloc title="Traitement des données personnelles">
                  {(young.dataProcessingConsentmentFiles || []).map((e, i) => (
                    <DownloadButton
                      key={i}
                      source={() => api.get(`/referent/youngFile/${young._id}/dataProcessingConsentmentFiles/${e}`)}
                      title={`Télécharger le document (${i + 1}/${young.dataProcessingConsentmentFiles.length})`}
                    />
                  ))}
                  {isFromFranceConnect(young) && (
                    <div style={{ marginTop: "1rem" }}>
                      <img src={require("../../../assets/fc_logo_v2.png")} height={60} />
                      <br />
                      <b>Consentement parental validé via FranceConnect.</b>
                      <br />
                      Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de s’affranchir du document de consentement papier.
                    </div>
                  )}
                </Bloc>
              ) : null}
              <Bloc title="Autotest PCR">
                <Details title="Autorisation" value={t(young.autoTestPCR)} />
                {(young.autoTestPCRFiles || []).map((e, i) => (
                  <DownloadButton
                    key={i}
                    source={() => api.get(`/referent/youngFile/${young._id}/autoTestPCRFiles/${e}`)}
                    title={`Télécharger le formulaire (${i + 1}/${young.autoTestPCRFiles.length})`}
                  />
                ))}
              </Bloc>
              {young.motivations && (
                <Bloc title="Motivations">
                  <div className="quote">{`« ${young.motivations} »`}</div>
                </Bloc>
              )}
            </Col>
            <Col md={6}>
              <Bloc title="Situation">
                <Details title="Statut" value={t(young.situation)} />
                <Details title="Classe" value={t(young.grade)} />
                <Details title="Type" value={young.schoolType} />
                <Details title="Nom" value={young.schoolName} />
                <Details title="Région" value={young.schoolRegion} />
                <Details title="Dép" value={young.schoolDepartment} />
                <Details title="Ville" value={young.schoolCity && young.schoolZip && `${young.schoolCity} (${young.schoolZip})`} />
                <Details title="Adresse" value={young.schoolAdress} />
              </Bloc>
              {young.jdc && young.cohort === "2020" && (
                <Bloc title="Journée de Défense et Citoyenneté">
                  <Details title="JDC réalisée" value={t(young.jdc)} />
                </Bloc>
              )}
              <Bloc title="Représentant légal n°1">
                <Details title="Statut" value={t(young.parent1Status)} />
                <Details title="Prénom" value={young.parent1FirstName} />
                <Details title="Nom" value={young.parent1LastName} />
                <Details title="E-mail" value={young.parent1Email} />
                <Details title="Tel" value={young.parent1Phone} />
                <Details title="Adresse" value={young.parent1Address} />
                <Details title="Ville" value={young.parent1City && young.parent1Zip && `${young.parent1City} (${young.parent1Zip})`} />
                <Details title="Dép" value={young.parent1Department} />
                <Details title="Région" value={young.parent1Region} />
              </Bloc>
              {young.parent2Status ? (
                <Bloc title="Représentant légal n°2">
                  <Details title="Statut" value={t(young.parent2Status)} />
                  <Details title="Prénom" value={young.parent2FirstName} />
                  <Details title="Nom" value={young.parent2LastName} />
                  <Details title="E-mail" value={young.parent2Email} />
                  <Details title="Tel" value={young.parent2Phone} />
                  <Details title="Adresse" value={young.parent2Address} />
                  <Details title="Ville" value={young.parent2City && young.parent2Zip && `${young.parent2City} (${young.parent2Zip})`} />
                  <Details title="Dép" value={young.parent2Department} />
                  <Details title="Région" value={young.parent2Region} />
                </Bloc>
              ) : null}
              {isFromFranceConnect() || (young.parentConsentmentFiles && young.parentConsentmentFiles.length) ? (
                <Bloc title="Attestations des représentants légaux">
                  {isFromFranceConnect() ? (
                    <div style={{ marginTop: "1rem" }}>
                      <img src={require("../../../assets/fc_logo_v2.png")} height={60} />
                      <br />
                      <b>Consentement parental validé via FranceConnect.</b>
                      <br />
                      Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de s’affranchir du document de consentement papier.
                    </div>
                  ) : (
                    (young.parentConsentmentFiles || []).map((e, i) => (
                      <DownloadButton
                        key={i}
                        source={() => api.get(`/referent/youngFile/${young._id}/parentConsentmentFiles/${e}`)}
                        title={`Télécharger l'attestation (${i + 1}/${young.parentConsentmentFiles.length})`}
                      />
                    ))
                  )}
                </Bloc>
              ) : null}
              <Bloc title="Consentements">
                <Details title={`Consentements validés par ${young.firstName} ${young.lastName}`} value={t(young.consentment || "false")} style={{ border: "none" }} />
                <ExpandComponent>{youngConsentmentText}</ExpandComponent>
                <Details title="Consentements validés par ses représentants légaux" value={t(young.parentConsentment || "false")} style={{ border: "none" }} />
                <ExpandComponent>{parentsConsentmentText}</ExpandComponent>
              </Bloc>
            </Col>
          </Row>
        </Box>
        <Emails email={young.email} />
        {young.statusPhase1 === "DONE" && young.statusPhase2 === "VALIDATED" ? (
          <DownloadAttestationButton young={young} uri="snu">
            Télécharger l&apos;attestation de réalisation du SNU
          </DownloadAttestationButton>
        ) : null}
      </YoungView>
    </div>
  );
}

const Bloc = ({ children, title, last }) => {
  return (
    <Row style={{ borderBottom: last ? 0 : "2px solid #f4f5f7" }}>
      <Wrapper>
        <div>
          <BoxTitle>{title}</BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, copy, style }) => {
  if (!value) return <div />;
  const [copied, setCopied] = React.useState(false);
  if (typeof value === "function") value = value();
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);
  return (
    <div className="detail" style={style}>
      <div className="detail-title">{`${title} :`}</div>
      <section style={{ display: "flex" }}>
        <div className="detail-text">{value}</div>
        {copy ? (
          <div
            className="icon"
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
            }}>
            {copied ? <TickDone color={colors.green} width={17} height={17} /> : <Copy color={colors.darkPurple} width={17} height={17} />}
          </div>
        ) : null}
      </section>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-top: 1rem;
    padding-bottom: 0.5rem;
    &-title {
      min-width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
`;

const Infos = styled.section`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  svg {
    margin-top: 4px;
  }
  p {
    flex: 1;
    margin: 0;
  }
`;
