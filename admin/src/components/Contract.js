import React, { useEffect, useState } from "react";
import { Row } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { useHistory } from "react-router-dom";
import { appURL } from "../config";
import { useSelector } from "react-redux";
import { APPLICATION_STATUS_COLORS, dateForDatePicker, getAge, ROLES, translate } from "../utils";
import api from "../services/api";
import DownloadAttestationButton from "./buttons/DownloadAttestationButton";
import Loader from "./Loader";
import { Box } from "./box";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import Badge from "./Badge";
import DownloadContractButton from "./buttons/DownloadContractButton";
import LoadingButton from "./buttons/LoadingButton";

export default ({ young, admin }) => {
  const history = useHistory();

  let { applicationId } = useParams();
  // manager_department

  // We load the first application that has VALIDATED status.
  // Then we load associated mission, tutor and structure (because we need all this mess).
  const [application, setApplication] = useState(null);
  const [contract, setContract] = useState(null);
  const [mission, setMission] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [managerDepartment, setManagerDepartment] = useState(null);
  const [structure, setStructure] = useState(null);
  const [loadings, setLoadings] = useState({
    saveButton: false,
    submitButton: false,
  });
  useEffect(() => {
    const getApplication = async () => {
      if (!young) return;
      let { ok, data, code } = await api.get(`/application/young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      const currentApplication = data.find((e) => e._id === applicationId);

      if (currentApplication.contractId) {
        ({ ok, data, code } = await api.get(`/contract/${currentApplication.contractId}`));
        if (!ok) return toastr.error("Oups, une erreur est survenue", code);
        setContract(data);
      }
      setApplication(currentApplication);
    };
    getApplication();
  }, []);
  useEffect(() => {
    const getMission = async () => {
      if (!application) return;
      const { ok, data, code } = await api.get(`/mission/${application.missionId}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setMission(data);
    };
    getMission();
  }, [application]);
  useEffect(() => {
    const getTutor = async () => {
      if (!application || !(application.tutorId || application.tutor?._id)) return;
      const { ok, data, code } = await api.get(`/referent/${application.tutorId || application.tutor?._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setTutor(data);
    };
    getTutor();
  }, [application]);
  useEffect(() => {
    const getManagerDepartment = async () => {
      if (!young) return;
      const { ok, data, code } = await api.get(`/referent/manager_department/${young.department}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setManagerDepartment(data);
    };
    getManagerDepartment();
  }, [young]);
  useEffect(() => {
    const getStructure = async () => {
      if (!application) return;
      const { ok, data, code } = await api.get(`/structure/${application.structureId}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setStructure(data);
    };
    getStructure();
  }, [application]);

  const onSubmit = async (values) => {
    try {
      values.sendMessage
        ? setLoadings({
            saveButton: false,
            submitButton: true,
          })
        : setLoadings({
            saveButton: true,
            submitButton: false,
          });
      const { ok, code } = await api.post(`/contract`, {
        ...values,
        youngId: young._id,
        structureId: structure._id,
        applicationId: application._id,
        missionId: mission._id,
        tutorId: tutor?._id,
        isYoungAdult: isYoungAdult ? "true" : "false",
      });
      setLoadings({
        saveButton: false,
        submitButton: false,
      });
      if (!ok) return toastr.error("Erreur !", translate(code));
      if (values.sendMessage) {
        toastr.success("Le message a été envoyé aux parties prenantes");
      } else {
        toastr.success("Contrat sauvegardé");
      }
      // Refresh
      history.go(0);
    } catch (e) {
      setLoadings({
        saveButton: false,
        submitButton: false,
      });
      toastr.error("Erreur !", translate(e.code));
    }
  };

  if (!application || !mission) return <Loader />;

  const isYoungAdult = getAge(young.birthdateAt) >= 18;

  let initialValues = null;
  if (contract) {
    initialValues = { ...contract, sendMessage: false };
  } else {
    initialValues = {
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngBirthdate: young.birthdateAt ? dateForDatePicker(young.birthdateAt) : "",
      youngAddress: young.address,
      youngCity: young.city,
      youngDepartment: young.department,
      youngEmail: young.email,
      youngPhone: young.phone,
      parent1FirstName: young.parent1FirstName,
      parent1LastName: young.parent1LastName,
      parent1Address: young.parent1OwnAddress === "true" ? young.parent1Address : young.address,
      parent1City: young.parent1OwnAddress === "true" ? young.parent1City : young.city,
      parent1Department: young.parent1OwnAddress === "true" ? young.parent1Department : young.department,
      parent1Phone: young.parent1Phone,
      parent1Email: young.parent1Email,
      parent2FirstName: young.parent2FirstName,
      parent2LastName: young.parent2LastName,
      parent2Address: young.parent2Email ? (young.parent2OwnAddress === "true" ? young.parent2Address : young.address) : "",
      parent2City: young.parent2Email ? (young.parent2OwnAddress === "true" ? young.parent2City : young.city) : "",
      parent2Department: young.parent2Email ? (young.parent2OwnAddress === "true" ? young.parent2Department : young.department) : "",
      parent2Phone: young.parent2Phone,
      parent2Email: young.parent2Email,
      missionName: mission.name,
      missionObjective: mission.description,
      missionAction: mission.actions,
      missionStartAt: mission.startAt ? dateForDatePicker(mission.startAt) : "",
      missionEndAt: mission.endAt ? dateForDatePicker(mission.endAt) : "",
      missionAddress: mission.address || "",
      missionCity: mission.city || "",
      missionZip: mission.zip || "",
      missionDuration: mission.duration || "",
      missionFrequence: mission.frequence || "",
      date: dateForDatePicker(new Date()),
      projectManagerFirstName: managerDepartment?.firstName || "",
      projectManagerLastName: managerDepartment?.lastName || "",
      projectManagerRole: "Chef de Projet départemental",
      projectManagerEmail: managerDepartment?.email || "",
      structureManagerFirstName: tutor?.firstName || "",
      structureManagerLastName: tutor?.lastName || "",
      structureManagerRole: "Tuteur de mission",
      structureManagerEmail: tutor?.email || "",
      structureSiret: structure?.siret || "",
      structureName: structure?.name || "",
      sendMessage: false,
    };
  }

  const hasAllValidation =
    contract &&
    contract.projectManagerStatus === "VALIDATED" &&
    contract.structureManagerStatus === "VALIDATED" &&
    ((isYoungAdult && contract.youngContractStatus === "VALIDATED") ||
      (!isYoungAdult && contract.parent1Status === "VALIDATED" && (!young.parent2Email || contract.parent2Status === "VALIDATED")));

  return (
    <>
      <BackLink
        onClick={() => {
          history.push(`/volontaire/${young._id}/${admin ? "phase2" : ""}`);
        }}
      >
        {"<"} Revenir à la fiche volontaire
      </BackLink>
      <Box>
        <Bloc title="Contrat d’engagement en mission d’intérêt général">
          <div style={{ display: "grid", gridAutoColumns: "1fr", gridAutoFlow: "column" }}>
            <div style={{ display: "flex" }}>
              <p style={{ flex: 1 }}>Ce contrat doit être validé par le(s) représentant(s) légal(aux) du volontaire, le tuteur de mission et le référent départemental.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              {contract?.invitationSent === "true" ? (
                <Badge text="Contrat envoyé" style={{ verticalAlign: "top" }} color={APPLICATION_STATUS_COLORS.VALIDATED} />
              ) : (
                <Badge text="Contrat pas encore envoyé" style={{ verticalAlign: "top" }} />
              )}
            </div>
          </div>
          <hr />
          <div style={{ display: "grid", gridAutoColumns: "1fr", gridAutoFlow: "column" }}>
            <ContractStatusBadge title="Représentant de l'Etat" contract={contract} status={contract?.projectManagerStatus} token={contract?.projectManagerToken} />
            <ContractStatusBadge title="Représentant structure" contract={contract} status={contract?.structureManagerStatus} token={contract?.structureManagerToken} />
            {!isYoungAdult ? (
              <>
                <ContractStatusBadge title="Représentant légal 1" contract={contract} status={contract?.parent1Status} token={contract?.parent1Token} />
                {young.parent2Email && <ContractStatusBadge title="Représentant légal 2" contract={contract} status={contract?.parent2Status} token={contract?.parent2Token} />}
              </>
            ) : (
              <ContractStatusBadge title="Volontaire" contract={contract} status={contract?.youngContractStatus} token={contract?.youngContractToken} />
            )}
          </div>
        </Bloc>
      </Box>
      {hasAllValidation ? (
        <DownloadContractButton young={young} uri={contract?._id}>
          Télécharger le contrat
        </DownloadContractButton>
      ) : (
        <Formik validateOnChange={false} validateOnBlur={false} initialValues={initialValues} onSubmit={onSubmit}>
          {({ values, errors, touched, isSubmitting, handleChange, handleSubmit, setFieldValue, validateForm }) => {
            const context = { values, errors, touched, handleChange };
            return (
              <>
                <Box>
                  <Bloc title="">
                    <ContractContainer>
                      <div style={{ display: "flex", marginBottom: "3rem" }}>
                        <div style={{ marginRight: "2rem" }}>
                          <img src={require("../assets/logo-snu.png")} height={96} />
                        </div>
                        <div style={{ marginRight: "2rem", textAlign: "center", marginTop: "-1rem" }}>
                          <h2>Contrat d’engagement en mission d’intérêt général (MIG) du service national universel (SNU)</h2>
                        </div>
                      </div>
                      <div>
                        <p>
                          Le décret n° 2020-922 du 29 juillet 2020 portant dispositions diverses relatives au service national universel a créé la « Réserve du service national
                          universel », nouvelle réserve civique relevant des dispositions de la loi du 27 janvier 2017 relative à l’égalité et à la citoyenneté. Dans ce nouveau
                          cadre réglementaire, les missions d’intérêt général revêtent « un caractère philanthropique, éducatif, environnemental, scientifique, social, sportif,
                          familial ou culturel, ou concourent à des missions de défense et de sécurité civile ou de prévention ou à la prise de conscience de la citoyenneté
                          française et européenne ». Le décret du 29 juillet 2020 a précisé qu’une mission d’intérêt général correspond à un engagement volontaire d’une durée
                          minimale de quatre-vingt-quatre heures, qui peut être accomplie de manière continue ou, dans la limite d’une période d’une année, de manière discontinue.
                        </p>
                      </div>
                      <div>
                        <h2>Entre les soussignés,</h2>
                        <div>
                          <h3> L’Etat, représenté par</h3>
                          <div>
                            <ContractField name="projectManagerFirstName" placeholder="Prénom" context={context} />
                            <ContractField name="projectManagerLastName" placeholder="Nom" context={context} />
                            agissant en qualité de
                            <ContractField name="projectManagerRole" placeholder="Rôle" className="md" context={context} />
                            <div>
                              Email :
                              <ContractField name="projectManagerEmail" placeholder="Email" className="md" context={context} />
                            </div>
                          </div>
                        </div>
                        <h2>ET</h2>
                        <div>
                          <h3> La structure d’accueil représentée par</h3>
                          <div>
                            <ContractField name="structureManagerFirstName" placeholder="Prénom" context={context} />
                            <ContractField name="structureManagerLastName" placeholder="Nom" context={context} />
                            agissant en qualité de
                            <ContractField name="structureManagerRole" placeholder="Rôle" className="md" context={context} />
                            <div>
                              Email :
                              <ContractField name="structureManagerEmail" placeholder="Email" className="md" context={context} />
                            </div>
                            <div>
                              Siret (optionnel) :
                              <ContractField name="structureSiret" placeholder="12345678901234" className="md" context={context} optional={true} />
                            </div>
                          </div>
                        </div>
                        <h2>ET</h2>
                        <div>
                          <h3> Le volontaire</h3>
                          <div>
                            <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                            <ContractField name="youngLastName" placeholder="Nom" context={context} />
                            <div>
                              né le :
                              <ContractField name="youngBirthdate" context={context} type="date" placeholder="jj/mm/yyyy" />
                            </div>
                            <div>
                              demeurant :
                              <ContractField name="youngAddress" placeholder="Adresse" className="md" context={context} />
                              <ContractField name="youngCity" placeholder="Ville" context={context} />
                              <ContractField name="youngDepartment" placeholder="Département" context={context} />
                            </div>
                            Email : <ContractField name="youngEmail" placeholder="Email" className="md" type="email" context={context} />
                            Téléphone :
                            <ContractField name="youngPhone" placeholder="0123456789" className="md" context={context} />
                          </div>
                        </div>
                        {!isYoungAdult && (
                          <>
                            <h2>Représenté par ses représentant légaux</h2>
                            <div>
                              1) Le représentant légal du volontaire n°1 :
                              <ContractField name="parent1FirstName" placeholder="Prénom" context={context} />
                              <ContractField name="parent1LastName" placeholder="Nom" context={context} />
                              disposant de l’autorité parentale,
                              <div>
                                demeurant à
                                <ContractField name="parent1Address" placeholder="Adresse" className="md" context={context} />
                                <ContractField name="parent1City" placeholder="Ville" context={context} />
                                <ContractField name="parent1Department" placeholder="Département" context={context} />
                              </div>
                              Email : <ContractField name="parent1Email" placeholder="Email" className="md" type="email" context={context} />
                              Téléphone :
                              <ContractField name="parent1Phone" placeholder="0123456789" className="md" context={context} />
                            </div>
                            {young.parent2Email && (
                              <div>
                                2) Le représentant légal du volontaire n°2 :
                                <ContractField name="parent2FirstName" placeholder="Prénom" context={context} optional={true} />
                                <ContractField name="parent2LastName" placeholder="Nom" context={context} optional={true} />
                                disposant de l’autorité parentale,
                                <div>
                                  demeurant à
                                  <ContractField name="parent2Address" placeholder="Adresse" className="md" context={context} optional={true} />
                                  <ContractField name="parent2City" placeholder="Ville" context={context} optional={true} />
                                  <ContractField name="parent2Department" placeholder="Département" context={context} optional={true} />
                                </div>
                                Email : <ContractField name="parent2Email" placeholder="Email" className="md" type="email" context={context} optional={true} />
                                Téléphone :
                                <ContractField name="parent2Phone" placeholder="0123456789" className="md" context={context} optional={true} />
                              </div>
                            )}
                          </>
                        )}
                        <hr />
                        <div>
                          <br />
                          <p>Il a été convenu ce qui suit :</p>
                        </div>
                        <h3>a) Objet</h3>
                        <div>
                          <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                          <ContractField name="youngLastName" placeholder="Nom" context={context} />
                          s’engage à réaliser une mission d’intérêt général validée par l’autorité territoriale en charge du SNU.
                          <div>
                            La mission
                            <ContractField className="lg" name="missionName" placeholder="Nom de la mission" context={context} />
                            <br />
                          </div>
                          <div>
                            Les objectifs de la missions sont les suivants :
                            <ContractField name="missionObjective" placeholder="Objectifs" as="textarea" context={context} />
                          </div>
                          <div>
                            A ce titre, le volontaire exercera les activités suivantes :
                            <ContractField name="missionAction" placeholder="Actions" as="textarea" context={context} />
                          </div>
                          <p>
                            La nature ou l’exercice des missions ne peuvent porter sur les activités relevant des articles D. 4153-15 à D. 4153-40 du code du travail c’est-à-dire
                            les catégories de travaux définies en application de l’article L. 4153-8 du même code, interdites aux jeunes de moins de 18 ans, en ce qu’elles les
                            exposeraient à des risques pour leur santé, leur sécurité, leur moralité ou excéderaient leurs forces.
                          </p>
                        </div>
                        <h3>b) Date d’effet et durée du contrat</h3>
                        <div>
                          Le présent contrat, pour la réalisation de la mission indiquée ci-dessus, prend effet à la date de signature du présent contrat par les trois parties
                          prenantes. <br />
                          La mission d’intérêt général débute le
                          <ContractField name="missionStartAt" placeholder="jj/mm/yyyy" type="date" context={context} />
                          jusqu’au
                          <ContractField name="missionEndAt" placeholder="jj/mm/yyyy" type="date" context={context} />
                          <br /> Le volontaire effectuera un total de
                          <ContractField name="missionDuration" placeholder="nombre d'heure" context={context} />
                          heures de MIG.
                        </div>
                        <h3>c) Conditions d’exercice des missions</h3>
                        <div>
                          La mission s’effectue à
                          <ContractField className="md" name="missionAddress" placeholder="adresse" context={context} />
                          <ContractField name="missionCity" placeholder="Ville" context={context} />
                          <ContractField name="missionZip" placeholder="Code postal" context={context} />
                          <br />
                          au sein de la structure d’accueil retenue par l’administration :
                          <ContractField className="lg" name="structureName" placeholder="Nom de la structure" context={context} />
                          <p>
                            La durée quotidienne de la mission est égale à sept heures au maximum. Une pause de trente minutes doit être appliquée pour toute période de mission
                            ininterrompue atteignant quatre heures et demie.
                          </p>
                          <p>
                            Les missions effectuées entre 22 heures et 6 heures sont interdites. Pour les missions effectuées de manière continue, le repos hebdomadaire est de deux
                            jours consécutifs au minimum.
                          </p>
                          <p>Si le volontaire est scolarisé, la mission ne peut être effectuée sur le temps scolaire.</p>
                          <p>
                            Si le volontaire travaille, le temps de travail cumulé avec le temps d’accomplissement de la mission d’intérêt général ne peut excéder 7 heures par jour
                            et 35 heures par semaine.
                          </p>
                          <p>Les horaires du volontaire pour la présente mission sont :</p>
                          <ContractField name="missionFrequence" placeholder="Du lundi au vendredi" as="textarea" context={context} />
                          Le volontaire bénéficie, pour assurer l’accomplissement de sa mission, de l’accompagnement d’un tuteur de mission
                          <ContractField name="structureManagerFirstName" placeholder="Prénom" context={context} />
                          <ContractField name="structureManagerLastName" placeholder="Nom" context={context} />
                          de la structure d’accueil. Le volontaire bénéficie, par son tuteur, d’entretiens réguliers permettant un suivi de la réalisation des missions ainsi que,
                          le cas échéant, d’un accompagnement renforcé.
                        </div>
                        <h3>d) Obligations réciproques des parties</h3>
                        <div>
                          <p>
                            L’Etat s’engage à identifier les missions susceptibles d’être proposées au volontaire dans le cadre des missions d’intérêt général. L’Etat s’assure de
                            la qualité des conditions de réalisation de cette mission au regard des finalités du SNU. Enfin, l’Etat valide la réalisation de la mission du
                            volontaire. La structure d’accueil s’engage à proposer des missions permettant la mobilisation du volontaire en faveur de l’intérêt général. Un mentor
                            est nommé au sein de la structure afin de s’assurer du suivi du volontaire et de la qualité des conditions de son accueil.
                          </p>
                          <p>
                            Le cas échéant, la structure d’accueil précise les frais qu’elle entend prendre en charge, totalement ou partiellement, dans le cadre de la mission
                            d’intérêt général (frais de transports, repas, hébergement…).
                          </p>
                          <p>
                            Le volontaire s’engage à respecter le règlement intérieur de la structure qui l’accueille, à respecter les personnes, le matériel et les locaux et à
                            agir en conformité avec les exigences de son engagement dans le cadre du SNU : ponctualité, politesse, implication. Le volontaire est tenu à la
                            discrétion pour les faits et informations dont il a connaissance dans l’exercice de ses missions. Il est également tenu aux obligations de convenance et
                            de réserve inhérentes à ses fonctions.
                          </p>
                          <p>Le volontaire exécute la mission d’intérêt général à titre bénévole.</p>
                          <p>
                            L'engagement, l'affectation et l'activité du volontaire ne sont régis ni par le code du travail, ni par le chapitre Ier de la loi n° 84-16 du 11 janvier
                            1984 portant dispositions statutaires relatives à la fonction publique de l'Etat, le chapitre Ier de la loi n° 84-53 du 26 janvier 1984 portant
                            dispositions statutaires relatives à la fonction publique territoriale ou le chapitre Ier de la loi n° 86-33 du 9 janvier 1986 portant dispositions
                            statutaires relatives à la fonction publique hospitalière. Le cas échéant, la structure d’accueil, directement ou par le mentor désigné, informe le
                            représentant de l’Etat, signataire du présent contrat, des difficultés rencontrées dans l’exécution du présent contrat.
                          </p>
                          <p>
                            Conformément aux dispositions du décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel, le
                            volontaire et la structure d’accueil s’engagent à respecter les principes directeurs ainsi que les engagements et obligations des réservistes et des
                            structures d’accueil énoncés par la charte de la réserve civique, annexée au présent contrat, dans sa version issue du décret n° 2017-930 du 9 mai 2017.
                          </p>
                        </div>
                        <h3>e) Journée de fin de mission d’intérêt général</h3>
                        <div>
                          <p>
                            Une journée de fin de mission d’intérêt général est organisée, en dehors des heures de MIG mentionnées au b), pour préparer une éventuelle participation
                            du volontaire à la phase III du SNU, soit un engagement volontaire de plusieurs mois, notamment dans le cadre du service civique ou du volontariat des
                            armées.
                          </p>
                          <p>La participation du volontaire est requise.</p>
                        </div>
                        <h3>f) Responsabilités</h3>
                        <div>
                          <p>La structure d’accueil est chargée de la surveillance et de la sécurité du volontaire accueilli.</p>
                          <p>L'organisme d'accueil le couvre des dommages subis par lui ou causés à des tiers dans l'accomplissement de sa mission.</p>
                        </div>
                        <h3>g) Résiliation du contrat</h3>
                        <div>
                          <p>
                            Le présent contrat de mission d’intérêt général peut être résilié moyennant un préavis d’une journée sauf en cas de force majeure ou de faute grave
                            d’une des parties.
                          </p>
                          <p>Avant de résilier le contrat, la structure d’accueil prévient le représentant de l’Etat</p>
                        </div>
                        <h3>h) Conditions de validation de la mission d’intérêt général</h3>
                        <div>
                          La confirmation de la réalisation de la mission d'intérêt général est effectuée par le tuteur de mission qui, au nom de la structure d'accueil, effectue
                          la procédure de fin de mission sur la plateforme.
                          <br />
                          La validation est conditionnée à la réalisation de
                          <ContractField name="missionDuration" placeholder="nombre d'heure" context={context} />
                          heures de mission au minimum au sein de la structure.
                          <br />
                          La mission est accomplie de manière continue, ou dans la limite de la période d’une année, de manière discontinue.
                        </div>
                        <div>
                          Le
                          <ContractField name="date" placeholder="date" type="date" context={context} />
                        </div>
                        <div>
                          <br />
                          <div>
                            Représentant de l’Etat{" "}
                            {contract?.invitationSent === "true" ? (
                              <Badge
                                text={contract.projectManagerStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                                color={contract.projectManagerStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                              />
                            ) : (
                              <Badge text="Pas encore envoyé" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div>
                            Représentant de la structure d’accueil{" "}
                            {contract?.invitationSent === "true" ? (
                              <Badge
                                text={contract.structureManagerStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                                color={contract.structureManagerStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                              />
                            ) : (
                              <Badge text="Pas encore envoyé" />
                            )}
                          </div>
                        </div>
                        {!isYoungAdult ? (
                          <>
                            <div>
                              Le volontaire, <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                              <ContractField name="youngLastName" placeholder="Nom" context={context} />
                              représenté par ses représentant légaux :
                            </div>
                            <div>
                              <br />
                              <div>
                                Représentant légal du volontaire (1){" "}
                                {contract?.invitationSent === "true" ? (
                                  <Badge
                                    text={contract.parent1Status === "VALIDATED" ? "Validé" : "En attente de validation"}
                                    color={contract.parent1Status === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                                  />
                                ) : (
                                  <Badge text="Pas encore envoyé" />
                                )}
                              </div>
                            </div>
                            {values.parent2Email && (
                              <div>
                                <div>
                                  Représentant légal du volontaire (2){" "}
                                  {contract?.invitationSent === "true" ? (
                                    <Badge
                                      text={contract.parent2Status === "VALIDATED" ? "Validé" : "En attente de validation"}
                                      color={contract.parent2Status === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                                    />
                                  ) : (
                                    <Badge text="Pas encore envoyé" />
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>
                              Le volontaire, <ContractField name="youngFirstName" placeholder="Prénom" context={context} />
                              <ContractField name="youngLastName" placeholder="Nom" context={context} />
                            </div>
                            <div>
                              <br />
                              <div>
                                Le volontaire{" "}
                                {contract?.invitationSent === "true" ? (
                                  <Badge
                                    text={contract.youngContractStatus === "VALIDATED" ? "Validé" : "En attente de validation"}
                                    color={contract.youngContractStatus === "VALIDATED" ? APPLICATION_STATUS_COLORS.VALIDATED : APPLICATION_STATUS_COLORS.WAITING_VALIDATION}
                                  />
                                ) : (
                                  <Badge text="Pas encore envoyé" />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <h2>CHARTE DE LA RÉSERVE CIVIQUE</h2>
                        <h3>1° Principes directeurs</h3>
                        <p>
                          La réserve civique permet à toute personne qui le souhaite de s'engager à servir les valeurs de la République en participant à des missions d'intérêt
                          général, à titre bénévole et occasionnel.
                        </p>
                        <p>
                          La réserve civique, ses sections territoriales et les réserves thématiques qu'elle comporte favorisent la participation de tout citoyen à ces missions,
                          dans un cadre collectif, ponctuel ou, à titre exceptionnel, récurrent, quelles que soient ses aptitudes et compétences. Elle concourt au renforcement du
                          lien social en favorisant la mixité sociale.
                        </p>
                        <p>
                          Les domaines d'actions de la réserve civique, de ses sections territoriales et des réserves thématiques recouvrent des champs d'actions variés : la
                          solidarité, l'éducation, la culture, la santé, l'environnement, le sport, la mémoire et la citoyenneté, la coopération internationale, la sécurité ou
                          encore les interventions d'urgence en situation de crise ou d'événement exceptionnel.
                        </p>
                        <p>
                          La réserve civique est complémentaire des autres formes d'engagement citoyen que sont, d'une part, la garde nationale et les réserves opérationnelles et,
                          d'autre part, l'engagement bénévole et volontaire.
                        </p>
                        <h3>2° Engagements et obligations des réservistes et des organismes d'accueil</h3>
                        <p>L'affectation à une mission nécessite l'accord de l'organisme d'accueil et du réserviste.</p>
                        <h4>A. - Engagements et obligations des réservistes</h4>
                        <p>
                          Sous réserve de satisfaire aux conditions légales et réglementaires qui régissent la réserve civique et ses sections territoriales et aux règles
                          spécifiques propres aux réserves thématiques qu'elle comporte, peut être réserviste toute personne volontaire souhaitant s'engager dans le respect des
                          principes directeurs de la réserve civique.
                        </p>
                        <p>Toute personne qui participe à la réserve civique, ses sections territoriales ou l'une des réserves thématiques qu'elle comporte s'engage à :</p>
                        <ul>
                          <li>respecter la présente charte ;</li>
                          <li>apporter son concours à titre bénévole ;</li>
                          <li>s'engager pour une période déterminée, qui peut être renouvelée avec son accord ;</li>
                          <li>
                            accomplir la mission pour laquelle elle est mobilisée selon les instructions données par le responsable de l'organisme au sein duquel elle effectue sa
                            mission (ou par toute personne que ce responsable a désignée) en tenant compte des règles de service et de fonctionnement ;
                          </li>

                          <li>faire preuve d'une disponibilité adaptée aux exigences de son engagement ;</li>
                          <li>observer un devoir de réserve, de discrétion et de neutralité pendant l'exercice de sa mission ;</li>
                          <li>faire preuve de bienveillance envers toute personne en contact avec une mission de la réserve ;</li>
                          <li>rendre compte de sa mission à l'organisme qui l'accueille ;</li>
                          <li>signaler à l'autorité de gestion de la réserve compétente tout incident ou anomalie survenu à l'occasion de sa période d'engagement ;</li>

                          <li>promouvoir l'engagement citoyen sous toutes ses formes.</li>
                        </ul>
                        <h4>B. - Engagements et obligations des organismes d'accueil</h4>
                        <p>
                          Les organismes qui accueillent les réservistes sont les services de l'Etat, les personnes morales de droit public, notamment les établissements publics et
                          les collectivités territoriales, ainsi que les organismes sans but lucratif de droit français qui portent un projet d'intérêt général, répondant aux
                          orientations de la réserve civique et aux valeurs qu'elle promeut.
                        </p>
                        <p>
                          Une association cultuelle ou politique, une organisation syndicale, une congrégation, une fondation d'entreprise ou un comité d'entreprise ne peut
                          accueillir de réserviste.
                        </p>
                        <p>
                          Les organismes éligibles proposent aux réservistes des missions compatibles avec leurs obligations professionnelles. Il ne peut être opposé à l'employeur
                          une quelconque forme de réquisition.
                        </p>
                        <p>
                          Les missions impliquant une intervention récurrente de réservistes citoyens sont préalablement validées par l'autorité de gestion compétente de la réserve
                          civique.
                        </p>
                        <p>Les organismes d'accueil s'engagent à :</p>
                        <li>respecter la présente charte ;</li>
                        <li>proposer des missions conformes à l'objet de la réserve civique, ses sections territoriales et ses réserves thématiques ;</li>
                        <li>proposer des missions non substituables à un emploi ou à un stage ;</li>
                        <li>préparer le réserviste à l'exercice de sa mission ;</li>
                        <li>
                          prendre en considération les attentes, les compétences et les disponibilités exprimées par le réserviste au regard des besoins de la mission proposée ;
                        </li>
                        <li>le cas échéant, compléter la convention d'engagement décrivant précisément la mission du réserviste (fréquence, lieu d'exercice, durée) ;</li>
                        <li>attester du déroulement de la mission ;</li>
                        <li>participer à des actions de communication, de sensibilisation et de promotion de la réserve civique ;</li>
                        <li>couvrir le réserviste contre les dommages subis par lui ou causés à des tiers dans l'accomplissement de sa mission.</li>
                        <p>
                          Les organismes d'accueil peuvent par ailleurs rembourser les frais réellement engagés par le réserviste dans l'exercice de la mission qu'ils lui ont
                          confiée.
                        </p>
                        <p>
                          Tout manquement aux principes et engagements énoncés par la présente charte justifie qu'il soit mis fin à la participation de la personne ou de
                          l'organisme concerné à la réserve civique, ses sections territoriales ou ses réserves thématiques.
                        </p>
                      </div>
                    </ContractContainer>
                  </Bloc>
                </Box>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <LoadingButton
                    onClick={async () => {
                      if (contract?.invitationSent === "true") {
                        const confirmText =
                          "Si vous enregistrez les modifications, les parties prenantes ayant validé recevront une notification et devront à nouveau valider le contrat d'engagment. De la même manière, les parties prenantes dont l'email a été modifié recevront également un email.";
                        if (confirm(confirmText)) {
                          const erroredFields = await validateForm();
                          if (Object.keys(erroredFields).length) return toastr.error("Il y a des erreurs dans le formulaire");
                          setFieldValue("sendMessage", true, false);
                          handleSubmit();
                        }
                      } else {
                        setFieldValue("sendMessage", false, false);
                        onSubmit(values);
                      }
                    }}
                    color={"#fff"}
                    textColor={"#767697"}
                    loading={loadings.saveButton}
                    disabled={loadings.submitButton}
                  >
                    Enregistrer les modifications
                  </LoadingButton>
                  {contract?.invitationSent !== "true" && (
                    <LoadingButton
                      onClick={async () => {
                        const erroredFields = await validateForm();
                        if (Object.keys(erroredFields).length) return toastr.error("Il y a des erreurs dans le formulaire");
                        setFieldValue("sendMessage", true, false);
                        handleSubmit();
                      }}
                      loading={loadings.submitButton}
                      disabled={loadings.saveButton}
                    >
                      Envoyer une demande de validation aux {values.parent2Email ? "4" : "3"} parties prenantes
                    </LoadingButton>
                  )}
                </div>
                {Object.keys(errors).length ? (
                  <ErrorMessage>
                    Le contrat contient des erreurs <br />
                    <i>champ(s) manquant(s) ou invalide(s)</i>
                  </ErrorMessage>
                ) : null}
              </>
            );
          }}
        </Formik>
      )}
      {young.statusPhase2 === "VALIDATED" ? (
        <div style={{ marginTop: "2rem" }}>
          <DownloadAttestationButton young={young} uri="2">
            Télécharger l'attestation de réalisation de la phase 2
          </DownloadAttestationButton>
        </div>
      ) : null}
    </>
  );
};

const ContractField = ({ name, placeholder, optional, context: { values, errors, touched, handleChange }, ...rest }) => {
  const content = (
    <>
      {errors[name] && <ErrorInContractField>Ce champ est obligatoire</ErrorInContractField>}
      <Field validate={(v) => (optional ? undefined : !v)} value={values[name]} onChange={handleChange} name={name} placeholder={placeholder} {...rest} />
    </>
  );

  if (rest.as === "textarea") return <div>{content}</div>;
  return <span>{content}</span>;
};

const ErrorInContractField = styled.span`
  position: absolute;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  color: red;
`;

const Bloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper>
        <div style={{ display: "flex" }}>
          <Legend>{title}</Legend>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

function ContractStatusBadge({ title, ...rest }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div>{title}</div>
      <ContractStatusbadgeItem {...rest} />
    </div>
  );
}
function ContractStatusbadgeItem({ contract, status, token }) {
  const user = useSelector((state) => state.Auth.user);

  if (contract?.invitationSent !== "true") return <Badge text="Pas encore envoyé" />;
  else if (status === "VALIDATED") return <Badge text="Validé" color={APPLICATION_STATUS_COLORS.VALIDATED} />;
  else if (user.role !== ROLES.ADMIN) return <Badge text="En attente de validation" color={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} />;
  return (
    <>
      <Badge text="En attente de validation" color={APPLICATION_STATUS_COLORS.WAITING_VALIDATION} />
      <br />
      <CopyLink
        onClick={() => {
          navigator.clipboard.writeText(`${appURL}/validate-contract?token=${token}`);
          toastr.success("Le lien a été copié dans le presse papier.");
        }}
      >
        Copier le lien de validation
      </CopyLink>
    </>
  );
}

const CopyLink = styled.button`
  background: none;
  color: rgb(81, 69, 205);
  font-size: 0.8rem;
  font-style: italic;
  border: none;
  :hover {
    outline: none;
    text-decoration: underline;
  }
  padding: 0;
`;

const ErrorMessage = styled.div`
  border: 1px solid #fc8181;
  border-radius: 0.25em;
  margin-top: 1em;
  background-color: #fff5f5;
  color: #c53030;
  font-weight: 400;
  font-size: 12px;
  padding: 1em;
  text-align: center;
`;

const Wrapper = styled.div`
  padding: 2rem 3rem;
  width: 100%;
`;

const ContractContainer = styled.div`
  font-size: 1rem;
  padding: 3rem;
  margin: auto;
  input,
  textarea {
    padding: 0.5rem;
    margin: 1rem 0.25rem 0 0.25rem;
    background-color: #f3f2ff;
    border: 1px solid #372f78;
    border-radius: 8px;
  }
  input::placeholder {
    color: #b3b2bf;
  }
  textarea {
    width: 100%;
    height: 130px;
  }
  input.md {
    width: 250px;
  }
  input.lg {
    width: 400px;
  }
  h2,
  h3,
  h4 {
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }
  h2 {
    margin-top: 2rem;
    font-size: 1.25rem;
  }
  h3 {
    font-size: 1.175rem;
  }
  h4 {
    font-size: 1rem;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  font-size: 1.3rem;
  font-weight: 500;
`;

const BackLink = styled.div`
  color: #888;
  margin-bottom: 0.5rem;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;
