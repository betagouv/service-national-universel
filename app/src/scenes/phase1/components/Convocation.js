import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { translate } from "../../../utils";
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
  return (
    <Hero>
      <Content style={{ width: "100%" }}>
        <ConvocText style={{ fontWeight: "500", textDecoration: "underline", display: "flex" }}>
          Affaire suivie par :
          <div style={{ textAlign: "right" }}>
            {service.contactName} <br />
            {service.contactPhone}
          </div>
        </ConvocText>
        <ConvocText style={{ textAlign: "center" }}>
          <b>CONVOCATION</b>
          <br /> au séjour de cohésion dans le cadre du service national universel (SNU)
          <br /> <i style={{ fontSize: ".8rem" }}>Décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel</i>
        </ConvocText>
        <ConvocText>
          Votre candidature pour participer au séjour de cohésion, phase 1 du service national universel, du <b>21 juin au 2 juillet 2021</b>, a été retenue. Votre séjour se
          déroulera au : {center.name}, {center.address} {center.zip} {center.city}
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
                <b>Le</b> {getDepartureMeetingDate()}
              </div>
              <div>
                <b>Lieu de rassemblement prévu : </b>
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
              Attention à bien respecter l’horaire indiqué. En cas de retard, vous ne pourrez pas effectuer votre séjour de cohésion. Votre représentant légal doit rester jusqu’à
              votre prise en charge par les accompagnateurs
            </ConvocText>
            <ConvocText>
              Le RDV à la fin du séjour se déroule selon les mêmes modalités que le départ. Il est prévu le <b>{getReturnMeetingDate()}</b> au même lieu de rassemblement qu&apos;à
              l&apos;aller.
              <br /> Votre représentant légal se présentera au lieu et horaire indiqué ci-dessus. Il veillera à bien respecter l’horaire indiqué.
            </ConvocText>
          </>
        )}
        <ConvocText>Il vous est demandé de vous présenter avec :</ConvocText>
        <ConvocText>
          <ul style={{ marginLeft: "1rem" }}>
            <li>- Cette convocation,</li>
            <li>- Votre carte nationale d’identité,</li>
            <li>- Votre test PCR ou antigénique de moins de 72h (recommandé),</li>
            <li>- 4 masques jetables grand public filtration supérieure à 90%,</li>
            <li>- Votre repas n’étant pas pris en charge à l’aller, il vous est demandé de prévoir votre collation et votre boisson, en fonction de la durée de votre trajet,</li>
          </ul>
        </ConvocText>
        <ConvocText>
          Enfin, nous vous recommandons d’étiqueter vos bagages notamment pour les volontaires se rendant dans les centres par les moyens de transport mis à votre disposition.
        </ConvocText>
        <ConvocText>
          Afin que votre séjour se déroule dans les meilleures conditions, nous vous rappelons que chaque volontaire, lors de son inscription, s’est engagé à respecter le{" "}
          <a href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU_-_Réglement_intérieur.pdf" target="_blank" rel="noreferrer">
            règlement intérieur
          </a>{" "}
          du centre
        </ConvocText>
        <ConvocText>Nous vous souhaitons un excellent séjour de cohésion !</ConvocText>
        <Sign>
          Jean-Roger RIBAUD <br />
          Sous-directeur du service national universel
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
`;
