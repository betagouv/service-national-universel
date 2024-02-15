import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { supportURL } from "../../../../../config";
import api from "../../../../../services/api";
import { translate } from "../../../../../utils";
import { getMeetingHour, getReturnHour, transportDatesToString, htmlCleaner } from "snu-lib";

import Loader from "../../../../../components/Loader";
import { Hero, Content } from "../../../../../components/Content";

export default function Convocation({ center, meetingPoint, departureDate, returnDate }) {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [service, setService] = useState();

  const getService = async () => {
    const { data, code, ok } = await api.get(`/department-service/${young.department}`);
    if (!ok) return toastr.error("error", translate(code));
    setService(data);
  };

  useEffect(() => {
    if (young?.department && !service) getService();
  }, [young]);

  const getMeetingAddress = () => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    const complement = meetingPoint?.complementAddress.find((c) => c.cohort === young.cohort);
    const complementText = complement?.complement ? ", " + complement.complement : "";
    return meetingPoint.name + ", " + meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city + complementText;
  };

  if (!young.meetingPointId && young.deplacementPhase1Autonomous !== "true" && young.transportInfoGivenByLocal !== "true") {
    return (
      <Warning>
        ⚠️ Impossible d&apos;afficher votre convocation, merci de contacter le <a onClick={() => history.push("/besoin-d-aide")}>support</a>.
      </Warning>
    );
  }
  if ((young.meetingPointId && !meetingPoint) || !center || !service) return <Loader />;

  const contacts = service?.contacts.filter((c) => c.cohort === young.cohort) || [];

  return (
    <Hero>
      <Content style={{ width: "100%" }}>
        <ConvocText style={{ fontWeight: "500", textDecoration: "underline" }}>
          <div>Affaire suivie par :</div>
          <div
            dangerouslySetInnerHTML={{
              __html: htmlCleaner(
                contacts
                  .map((contact) => {
                    return `<li>${contact.contactName} - ${contact.contactPhone} - ${contact.contactMail}</li>`;
                  })
                  .join(""),
              ),
            }}
          />
        </ConvocText>

        <ConvocText style={{ textAlign: "center" }}>
          <b>CONVOCATION</b>
          <br /> au séjour de cohésion dans le cadre du service national universel (SNU)
          <br /> <i style={{ fontSize: ".8rem" }}>Article R.113-1 du code du service national</i>
        </ConvocText>
        <ConvocText>
          Je suis heureux de vous informer que votre candidature pour participer au séjour de cohésion, phase 1 du service national universel,{" "}
          <b>{transportDatesToString(departureDate, returnDate)}</b>, a été retenue. Votre séjour se déroulera au : {center.name}, {center.address} {center.zip} {center.city}
        </ConvocText>
        {young.transportInfoGivenByLocal === "true" ? (
          <ConvocText>Vos informations de transports vous seront transmises par email.</ConvocText>
        ) : (
          <>
            <ConvocText>
              Vous voudrez bien vous présenter <b>impérativement</b> à la date et au lieu suivants :
              <div className="text-center">
                <div>
                  <b>Le </b>
                  {dayjs(departureDate).locale("fr").format("dddd DD MMMM YYYY")}
                </div>
                <div>
                  <b>A </b> {getMeetingHour(meetingPoint)}
                </div>
                <div>
                  <b>Au </b>
                  {getMeetingAddress()}
                </div>
                <div>
                  {meetingPoint?.bus ? (
                    <>
                      <b>Numéro de transport</b> {`: ${meetingPoint?.bus?.busId}`}
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </ConvocText>
            <ConvocText style={{ border: "solid 1px #666", padding: "1rem", margin: "1rem" }}>
              Attention à bien respecter l&apos;horaire indiqué. En cas de retard, vous ne pourrez pas effectuer votre séjour de cohésion. Votre représentant légal doit rester
              jusqu&apos;à votre prise en charge par les accompagnateurs
            </ConvocText>
          </>
        )}
        <ConvocText>
          Il vous est demandé de confirmer votre participation en amont du départ via votre compte volontaire et de vous présenter au point de rassemblement avec :
        </ConvocText>
        <ConvocText>
          <ul style={{ marginLeft: "1rem" }}>
            <li>- votre convocation</li>
            <li>- votre pièce d&apos;identité</li>
            <li>- la fiche sanitaire complétée, sous enveloppe destinée au référent sanitaire,</li>
            <li>- en fonction des consignes sanitaires le jour du départ, 2 masques jetables à usage médical pour le transport en commun, </li>
            <li>- une collation ou un déjeuner froid, selon la durée de votre trajet entre le lieu de rassemblement et le centre du séjour.</li>
          </ul>
        </ConvocText>
        <ConvocText>Enfin, nous vous demandons de bien vouloir étiqueter vos bagages.</ConvocText>
        {young.transportInfoGivenByLocal === "true" ? (
          <ConvocText>
            Le <b>retour de votre séjour </b>est prévu au même endroit que le jour du départ en centre SNU.
          </ConvocText>
        ) : (
          <ConvocText>
            Le <b>retour de votre séjour </b>est prévu le {dayjs(returnDate).locale("fr").format("dddd DD MMMM YYYY")} à {getReturnHour(meetingPoint)}, au même endroit que le jour
            du départ en centre SNU.
          </ConvocText>
        )}
        <ConvocText>
          <b>
            Votre représentant légal veillera à bien respecter ces modalités de retour (horaire, lieu de prise en charge). Vous ne pourrez repartir seul, sauf si vous présentez une
            autorisation de votre représentant légal.
          </b>
        </ConvocText>
        <ConvocText>
          Afin que votre séjour se déroule dans les meilleures conditions, nous vous rappelons que chaque volontaire, lors de son inscription, s&apos;est engagé à respecter le{" "}
          <b>
            <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU-reglement-interieur-2024.pdf" target="_blank" rel="noreferrer">
              règlement intérieur
            </a>
          </b>{" "}
          du centre
        </ConvocText>
        <ConvocText>Nous vous félicitons pour votre engagement et vous souhaitons un excellent séjour de cohésion.</ConvocText>
        {young.cohort === "Octobre 2023 - NC" ? (
          <Sign>
            Louis Le Franc
            <br />
            Haut commissaire de la République en Nouvelle-Calédonie
          </Sign>
        ) : (
          <Sign>
            Thibaut de SAINT POL
            <br />
            Le Directeur de la jeunesse, de l&apos;éducation populaire et de la vie associative
          </Sign>
        )}
        <ConvocText style={{ border: "solid 1px #666", padding: "1rem" }}>
          Pour toute information complémentaire, rendez-vous sur votre compte volontaire (rubrique «{" "}
          <a className="underline" href={`${supportURL}/base-de-connaissance/phase-1-1-1`} target="_blank" rel="noreferrer">
            Besoin d&apos;aide
          </a>{" "}
          »).
        </ConvocText>
      </Content>
    </Hero>
  );
}

const Warning = styled.div`
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: 400;
  a {
    text-decoration: underline !important;
    cursor: pointer;
  }
`;

const ConvocText = styled.div`
  margin: 1rem;
`;

const Sign = styled.div`
  color: #2e2e2e;
  text-align: right;
  font-weight: 500;
  margin: 1rem;
`;
