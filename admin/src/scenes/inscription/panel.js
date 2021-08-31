import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { translate as t, isInRuralArea, getAge } from "../../utils";
import DownloadButton from "../../components/buttons/DownloadButton";
import Historic from "../../components/historic";
import api from "../../services/api";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import { appURL } from "../../config";

export default ({ onChange, value }) => {
  const [young, setYoung] = useState(null);

  useEffect(() => {
    (async () => {
      const id = value && value._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [value]);

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
          <div className="title">{`${value.firstName} ${value.lastName}`}</div>
        </div>
        <div>{t(value.gender)}</div>
        {value.birthdateAt && (
          <div>
            Né(e) le {formatDate(value.birthdateAt)} - {getAge(value.birthdateAt)} ans
          </div>
        )}
        <div style={{ display: "flex" }}>
          <Link to={`/volontaire/${value._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${value._id}`}>
            <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
          </a>
        </div>
      </div>
      {young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}
      <Info title="Pièce d’identité" id={value._id}>
        {(value.cniFiles || []).map((e, i) => (
          <DownloadButton
            key={i}
            source={() => api.get(`/referent/youngFile/${value._id}/cniFiles/${e}`)}
            title={`Télécharger la pièce d’identité (${i + 1}/${value.cniFiles.length})`}
          />
        ))}
      </Info>
      <Info title="Consentements du ou des représentants légaux" id={value._id}>
        {(value.parentConsentmentFiles || []).map((e, i) => (
          <DownloadButton
            key={i}
            source={() => api.get(`/referent/youngFile/${value._id}/parentConsentmentFiles/${e}`)}
            title={`Télécharger le formulaire (${i + 1}/${value.parentConsentmentFiles.length})`}
          />
        ))}
        {isFromFranceConnect(young) && (
          <div style={{ marginTop: "1rem" }}>
            <img src={require("../../assets/fc_logo_v2.png")} height={60} />
            <br />
            <b>Consentement parental validé via FranceConnect.</b>
            <br />
            Les représentants légaux ont utilisé FranceConnect pour s’identifier et consentir, ce qui permet de s’affranchir du document de consentement papier.
          </div>
        )}
      </Info>
      <Info title="Coordonnées" id={value._id}>
        <Details title="E-mail" value={value.email} />
        <Details title="Tel" value={value.phone} />
        <Details title="Région" value={value.region} />
        <Details title="Dép" value={value.department} />
        <Details title="Ville" value={value.city && value.zip && `${value.city} (${value.zip})`} />
        <Details title="Adresse" value={value.address} />
      </Info>
      <Info title="Situation" id={value._id}>
        <Details title="Statut" value={t(value.situation)} />
        <Details title="Type" value={value.schoolType} />
        <Details title="Nom" value={value.schoolName} />
        <Details title="Région" value={value.schoolRegion} />
        <Details title="Dép" value={value.schoolDepartment} />
        <Details title="Ville" value={value.schoolCity && value.schoolZip && `${value.schoolCity} (${value.schoolZip})`} />
        <Details title="Adresse" value={value.schoolAdress} />
      </Info>
      <Info title="Situations particulières" id={value._id}>
        <Details title="Quartier Prioritaire de la Ville" value={t(value.qpv)} />
        <Details title="Zone Rurale" value={t(isInRuralArea(value))} />
        <Details title="Handicap" value={t(value.handicap)} />
        <Details title="PPS" value={t(value.ppsBeneficiary)} />
        <Details title="PAI" value={t(value.paiBeneficiary)} />
        <Details title="Suivi médicosociale" value={t(value.medicosocialStructure)} />
        <Details title="Aménagement spécifique" value={t(value.medicosocialStructure)} />
        <Details title="Activités de haut niveau" value={t(value.highSkilledActivity)} />
      </Info>
      <Info title="Représentant légal n°1" id={value._id}>
        <Details title="Statut" value={t(value.parent1Status)} />
        <Details title="Prénom" value={value.parent1FirstName} />
        <Details title="Nom" value={value.parent1LastName} />
        <Details title="E-mail" value={value.parent1Email} />
        <Details title="Tel" value={value.parent1Phone} />
        <Details title="Région" value={value.parent1Region} />
        <Details title="Dép" value={value.parent1Department} />
        <Details title="Ville" value={value.parent1City && value.parent1Zip && `${value.parent1City} (${value.parent1Zip})`} />
        <Details title="Adresse" value={value.parent1Address} />
      </Info>
      {value.parent2Status && (
        <Info title="Représentant légal n°2" id={value._id}>
          <Details title="Statut" value={t(value.parent2Status)} />
          <Details title="Prénom" value={value.parent2FirstName} />
          <Details title="Nom" value={value.parent2LastName} />
          <Details title="E-mail" value={value.parent2Email} />
          <Details title="Tel" value={value.parent2Phone} />
          <Details title="Région" value={value.parent2Region} />
          <Details title="Dép" value={value.parent2Department} />
          <Details title="Ville" value={value.parent2City && value.parent2Zip && `${value.parent2City} (${value.parent2Zip})`} />
          <Details title="Adresse" value={value.parent2Address} />
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
    </Panel>
  );
};
