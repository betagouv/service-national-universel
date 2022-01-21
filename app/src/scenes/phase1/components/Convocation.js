import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { translate, translateCohort } from "../../../utils";
import { Hero, Content } from "../../../components/Content";

export default function Convocation() {
  const young = useSelector((state) => state.Auth.young);

  const [meetingPoint, setMeetingPoint] = useState();
  const [center, setCenter] = useState();
  const [service, setService] = useState();

  const isFromDOMTOM = () => {
    return ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Saint-Pierre-et-Miquelon", "Mayotte", "Saint-Martin", "Polynésie française", "Nouvelle-Calédonie"].includes(
      young.department,
    );
  };

  const getMeetingPoint = async () => {
    const { data, code, ok } = await api.get(`/meeting-point/${young.meetingPointId}`);
    if (!ok) return toastr.error("error", translate(code));
    setMeetingPoint(data);
  };
  const getCenter = async () => {
    const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
    if (!ok) return toastr.error("error", translate(code));
    setCenter(data);
  };
  const getService = async () => {
    const { data, code, ok } = await api.get(`/department-service/${young.department}`);
    if (!ok) return toastr.error("error", translate(code));
    setService(data);
  };

  useEffect(() => {
    // À changer par la suite ? Notamment le isFromDOMTOM() ?
    if (!isFromDOMTOM() && !young.meetingPointId && young.deplacementPhase1Autonomous !== "true") return console.log("unauthorized");
    getCenter();
    young.meetingPointId && getMeetingPoint();
    getService();
  }, [young]);

  const getMeetingAddress = () => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
    return meetingPoint.departureAddress;
  };
  const getDepartureMeetingDate = () => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return "dimanche 20 juin, 16:30"; //new Date("2021-06-20T14:30:00.000+00:00");
    return meetingPoint.departureAtString;
  };
  const getReturnMeetingDate = () => {
    if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return "vendredi 2 juillet, 14:00"; // new Date("2021-07-02T12:00:00.000+00:00");
    return meetingPoint.returnAtString;
  };

  if (!isFromDOMTOM() && !young.meetingPointId && young.deplacementPhase1Autonomous !== "true") return null;
  if ((young.meetingPointId && !meetingPoint) || !center || !service) return <Loader />;

  const contact = service.contacts.find((el) => el.cohort === young.cohort);

  return (
    <Hero>
      <Content style={{ width: "100%" }}>
        <ConvocText style={{ fontWeight: "500", textDecoration: "underline", display: "flex" }}>
          Affaire suivie par :
          <p style={{ textAlign: "right", marginLeft: "0.2rem", color: "black", fontSize: "1rem", fontWeight: "500" }}>
            {contact.contactName} <br />
            {contact.contactPhone}
          </p>
        </ConvocText>
        <ConvocText style={{ textAlign: "center" }}>
          <b>CONVOCATION</b>
          <br /> au séjour de cohésion dans le cadre du service national universel (SNU)
          <br /> <i style={{ fontSize: ".8rem" }}>Décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel</i>
        </ConvocText>
        <ConvocText>
          Je suis heureuse de vous informer que votre candidature pour participer au séjour de cohésion, phase 1 du service national universel,{" "}
          <b>{translateCohort(young.cohort)}</b>, a été retenue. Votre séjour se déroulera au : {center.name}, {center.address} {center.zip} {center.city}
        </ConvocText>
        {isFromDOMTOM() ? (
          <ConvocText>
            Merci de vous présenter <b>impérativement</b> à la <b>date</b>, à l&apos;<b>heure</b> et au <b>lieu</b> qui vous auront été indiqués par votre <b>service régional</b>{" "}
            (pour l&apos;aller et le retour).
          </ConvocText>
        ) : (
          <>
            <ConvocText>
              Vous voudrez bien vous présenter <b>impérativement</b> à la date et au lieu suivants :
              <div>
                <b>Le </b> {getDepartureMeetingDate()}
              </div>
              <div>
                <b>Au </b>
                {getMeetingAddress()}
              </div>
              <div>
                {meetingPoint?.bus ? (
                  <>
                    <b>Numéro de transport</b> {`: ${meetingPoint?.bus?.idExcel}`}
                  </>
                ) : (
                  ""
                )}
              </div>
            </ConvocText>
            <ConvocText style={{ border: "solid 1px #666", padding: "1rem", margin: "1rem" }}>
              Attention à bien respecter l&apos;horaire indiqué. En cas de retard, vous ne pourrez pas effectuer votre séjour de cohésion. Votre représentant légal doit rester
              jusqu&apos;à votre prise en charge par les accompagnateurs
            </ConvocText>
            <ConvocText>
              Le RDV à la fin du séjour se déroule selon les mêmes modalités que le départ. Il est prévu le <b>{getReturnMeetingDate()}</b> au même lieu de rassemblement qu&apos;à
              l&apos;aller.
              <br /> Votre représentant légal se présentera au lieu et horaire indiqué ci-dessus. Il veillera à bien respecter l&apos;horaire indiqué.
            </ConvocText>
          </>
        )}
        <ConvocText>Il vous est demandé de vous présenter avec :</ConvocText>
        <ConvocText>
          <ul style={{ marginLeft: "1rem" }}>
            <li>- Votre convocation</li>
            <li>- Une pièce d&apos;identité</li>
            <li>- La fiche sanitaire complétée sous pli</li>
            <li>- 2 masques jetables ayant une capacité de filtration supérieure à 90 %</li>
          </ul>
        </ConvocText>
        <ConvocText>Enfin, nous vous demandons de bien vouloir étiqueter vos bagages.</ConvocText>
        <ConvocText>
          Afin que votre séjour se déroule dans les meilleures conditions, nous vous rappelons que chaque volontaire, lors de son inscription, s&apos;est engagé à respecter le{" "}
          <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/reglement_interieur_Fevrier_2022.pdf" target="_blank" rel="noreferrer">
            règlement intérieur
          </a>{" "}
          du centre
        </ConvocText>
        <ConvocText>Vous adressant nos meilleurs vœux pour cette nouvelle année et vous souhaitant un excellent séjour de cohésion,</ConvocText>
        <Sign>
          Emmanuelle PÉRÈS <br />
          La directrice de la jeunesse, de l&apos;éducation populaire et de la vie associative, déléguée interministérielle à la jeunesse
        </Sign>
        <ConvocText style={{ border: "solid 1px #666", padding: "1rem" }}>
          Pour toute information complémentaire, rendez-vous sur votre compte volontaire ou sur la{" "}
          <a href="https://www.snu.gouv.fr/foire-aux-questions-11" target="_blank" rel="noreferrer">
            FAQ
          </a>{" "}
          du site snu.gouv.fr.
        </ConvocText>
      </Content>
    </Hero>
  );
}

const ConvocText = styled.div`
  margin: 1rem;
`;

const Sign = styled.div`
  color: #2e2e2e;
  text-align: right;
  font-weight: 500;
  margin: 1rem;
`;
