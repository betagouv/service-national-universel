import React from "react";
import styled from "styled-components";
import { Row, Col, Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Field, Formik } from "formik";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import DomainItem from "./domainItem";
import Button from "./button";
import RankingPeriod from "./rankingPeriod";
import MobilityCard from "./mobilityCard";
import TransportCard from "./transportCard";
import ErrorMessage, { requiredMessage } from "./errorMessage";
import { translate, MISSION_DOMAINS, PERIOD, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION } from "../../utils";
import Hero from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  return (
    <>
      <Hero>
        <Content>
          <h1>Préférences de missions</h1>
          <p>
            En vue de la mission d'intérêt général de la Phase 2, renseignez ci-dessous vos préférences. Ces choix permettront à l'administration de vous proposer des missions en
            cohérence avec vos motivations.
          </p>
        </Content>
        <div className="thumb" />
      </Hero>
      <Formik
        initialValues={{ ...young, firstName1: young.parent1FirstName, lastName1: young.parent1LastName, firstName2: young.parent2FirstName, lastName2: young.parent2LastName }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            console.log(values);
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite", translate(code));
            if (young) {
              dispatch(setYoung(young));
            }
            return toastr.success("Mis à jour !");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched, isSubmitting, submitForm }) => (
          <>
            <PreferenceItem title="Sélectionnez 3 thématiques qui vous intéressent le plus parmi les domaines d'action disponibles">
              <Field
                hidden
                validate={(v) => {
                  if (!v) return requiredMessage;
                  if (v.length < 3) return "Veuillez selectionner 3 domaines";
                }}
                name="domains"
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.CITIZENSHIP}
                title="Citoyenneté"
                subtitle="Animation d’un conseil citoyen, aide à la lutte contre le racisme, l’homophobie..."
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.CULTURE}
                title="Culture"
                subtitle="Restauration du patrimoine, aide à une association culturelle, bénévole au sein d’un salle de musique, d’un musée..."
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.DEFENSE}
                title="Défense et mémoire"
                subtitle="Préparations militaires, participation à des commémorations, entretien de lieux de mémoire, participation à l’organisation de visites...."
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.EDUCATION}
                title="Éducation"
                subtitle="Aide scolaire, aide à apprendre le français à Des personnes étrangères, animation dans des médiathèques"
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.ENVIRONMENT}
                title="Environnement"
                subtitle="Protection de la nature et des animaux, promotion du tri des déchets"
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.HEALTH}
                title="Santé"
                subtitle="Accompagnement de personnes vulnérables comme des enfants hospitalisés, des personnes âgées, organisation d’actions pour le téléthon ..."
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.SECURITY}
                title="Sécurité"
                subtitle="Gendarmerie - sapeurs-pompiers - associations de protection civile"
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.SOLIDARITY}
                title="Solidarité"
                subtitle="Aide aux sans-abris, aux migrants, aux personnes en situation de handicap ..."
              />
              <DomainItem
                name="domains"
                handleChange={handleChange}
                values={values}
                value={MISSION_DOMAINS.SPORT}
                title="Sport"
                subtitle="Animation d’un club ou d’une association sportive..."
              />
              <ErrorMessage errors={errors} touched={touched} name="domains" />
            </PreferenceItem>
            <PreferenceItem title="Quel est votre projet professionnel ?">
              <Wrapper>
                <Button
                  name="professionnalProject"
                  handleChange={handleChange}
                  values={values}
                  value={PROFESSIONNAL_PROJECT.UNIFORM}
                  title="Corps en uniforme"
                  onClick={() => {
                    handleChange({ target: { name: "professionnalProjectPrecision", value: "" } });
                  }}
                />
                <Button
                  name="professionnalProject"
                  handleChange={handleChange}
                  values={values}
                  value={PROFESSIONNAL_PROJECT.OTHER}
                  title="Autre"
                  onClick={() => {
                    handleChange({ target: { name: "professionnalProjectPrecision", value: "" } });
                  }}
                />
                <Button
                  name="professionnalProject"
                  handleChange={handleChange}
                  values={values}
                  value={PROFESSIONNAL_PROJECT.UNKNOWN}
                  title="Non connu pour le moment"
                  onClick={() => {
                    handleChange({ target: { name: "professionnalProjectPrecision", value: "" } });
                  }}
                />
              </Wrapper>
              <ErrorMessage errors={errors} touched={touched} name="professionnalProject" />
              {values.professionnalProject && values.professionnalProject !== PROFESSIONNAL_PROJECT.UNKNOWN ? (
                <>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.05rem", margin: "0.75rem 0", fontSize: "0,875rem", fontWeight: "500", color: "#6b7280" }}>
                    Précisez
                  </span>
                  {values.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
                    <Wrapper>
                      <Button
                        name="professionnalProjectPrecision"
                        handleChange={handleChange}
                        values={values}
                        value={PROFESSIONNAL_PROJECT_PRECISION.FIREFIGHTER}
                        title="Pompiers"
                      />
                      <Button name="professionnalProjectPrecision" handleChange={handleChange} values={values} value={PROFESSIONNAL_PROJECT_PRECISION.POLICE} title="Police" />
                      <Button name="professionnalProjectPrecision" handleChange={handleChange} values={values} value={PROFESSIONNAL_PROJECT_PRECISION.ARMY} title="Militaire" />
                    </Wrapper>
                  ) : (
                    <>
                      <Field
                        validate={(v) => {
                          if (!v) return requiredMessage;
                        }}
                        placeholder="Exemple : Je rêve de devenir danseuse étoile..."
                        className="form-control"
                        name="professionnalProjectPrecision"
                        value={values.professionnalProjectPrecision}
                        onChange={handleChange}
                      />
                      <ErrorMessage errors={errors} touched={touched} name="professionnalProjectPrecision" />
                    </>
                  )}
                  <ErrorMessage errors={errors} touched={touched} name="professionnalProjectPrecision" />
                </>
              ) : null}
            </PreferenceItem>
            <PreferenceItem title="Quelle période privilégiez-vous pour réaliser la mission d'intérêt général ?">
              <Wrapper style={{ alignItems: "center", marginBottom: "0.5rem" }}>
                <Button name="period" handleChange={handleChange} values={values} value={PERIOD.DURING_HOLIDAYS} title="Sur les vacances scolaires" />
                <span>OU</span>
                <Button name="period" handleChange={handleChange} values={values} value={PERIOD.DURING_SCHOOL} title="Sur le temps scolaire" />
              </Wrapper>
              <ErrorMessage errors={errors} touched={touched} name="period" />
              {values.period ? (
                <RankingPeriod
                  handleChange={handleChange}
                  title={values.period === PERIOD.DURING_HOLIDAYS ? "SUR LES VACANCES SCOLAIRES" : "SUR LE TEMPS SCOLAIRE"}
                  period={values.period}
                  values={values}
                  name="periodRanking"
                />
              ) : null}
            </PreferenceItem>
            <PreferenceItem
              title="Quelle est votre mobilité géographique ?"
              subtitle="Les frais de transport et d'hébergement sont à votre charge pour la réalisation de votre mission de phase 2."
            >
              <Row style={{ width: "100%" }}>
                <Col md={6}>
                  <MobilityCard title="MISSION À PROXIMITÉ DE" handleChange={handleChange} values={values} errors={errors} touched={touched} />
                </Col>
                <Col md={6}>
                  <TransportCard title="MOYEN(S) DE TRANSPORT PRIVILÉGIÉ(S)" handleChange={handleChange} values={values} errors={errors} touched={touched} />
                </Col>
              </Row>
            </PreferenceItem>
            <PreferenceItem title="Quel format de mission préfèrez-vous ?">
              <Wrapper style={{ alignItems: "center", marginBottom: "0.5rem" }}>
                <Button name="missionFormat" handleChange={handleChange} values={values} value="CONTINUOUS" title={translate("CONTINUOUS")} />
                OU
                <Button name="missionFormat" handleChange={handleChange} values={values} value="DISCONTINUOUS" title={translate("DISCONTINUOUS")} />
              </Wrapper>
              <ErrorMessage errors={errors} touched={touched} name="missionFormat" />
            </PreferenceItem>
            <PreferenceItem title="Etes-vous engagés comme bénévole en parallèle de votre inscription au SNU ?">
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <Button name="engaged" handleChange={handleChange} values={values} value="true" title="OUI" />
                OU
                <Button name="engaged" handleChange={handleChange} values={values} value="false" title="NON" />
              </div>
              <ErrorMessage errors={errors} touched={touched} name="engaged" />
              {values.engaged === "true" ? (
                <>
                  <Field
                    hidden
                    validate={(v) => {
                      if (!v) return requiredMessage;
                    }}
                    name="engagedDescription"
                  />
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Expliquez cette mission en quelques mots..."
                    name="engagedDescription"
                    value={values.engagedDescription}
                    onChange={handleChange}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="engagedDescription" />
                </>
              ) : null}
            </PreferenceItem>
            <PreferenceItem title="Avez-vous déjà une idée de là où vous voudriez réaliser votre mission d'intérêt général ? (Optionel)">
              <Input
                type="textarea"
                rows={3}
                placeholder="Précisez à l'administration le lieu où vous souhaiteriez effectuer votre mission..."
                name="desiredLocation"
                value={values.desiredLocation}
                onChange={handleChange}
              />
            </PreferenceItem>
            <Footer>
              <ContinueButton onClick={handleSubmit}>Enregistrer mes préférences</ContinueButton>
              {Object.keys(errors).length ? <h3>Vous ne pouvez pas enregistrer votre avancée car tous les champs ne sont pas correctement renseignés.</h3> : null}
            </Footer>
          </>
        )}
      </Formik>
    </>
  );
};

const Infos = styled.div`
  font-size: 0.8rem;
  color: #6a7181;
  font-weight: 400;
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const PreferenceItem = ({ title, children, subtitle }) => {
  return (
    <Hero>
      <PreferenceContent style={{ width: "100%" }}>
        <Title>
          <span>{title}</span>
          <Infos>{subtitle}</Infos>
        </Title>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
      </PreferenceContent>
    </Hero>
  );
};

const Wrapper = styled.div`
  display: flex;
  text-align: center;
  @media (max-width: 767px) {
    display: block;
    > * {
      margin: 0.5rem auto;
    }
  }
`;

const Footer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const Title = styled.div`
  position: relative;
  text-align: center;
  font-size: 1.25rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 700;
  margin: 1rem 0;
  ::after {
    content: "";
    display: block;
    height: 1px;
    width: 100%;
    background-color: #d2d6dc;
    position: absolute;
    left: 0;
    top: 50%;
    @media (max-width: 768px) {
      top: 110%;
    }
    transform: translateY(-50%);
    z-index: -1;
  }
  span {
    padding: 0 10px;
    background-color: #fff;
    color: rgb(22, 30, 46);
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #fff;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
`;

const PreferenceContent = styled(Content)`
  padding: 2rem;
  padding-top: 0.5rem;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
