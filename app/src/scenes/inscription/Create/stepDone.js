import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Field, Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Spinner, Row } from "reactstrap";

import { SENDINBLUE_TEMPLATES, YOUNG_STATUS, translate as t, formatStringDate, getAge, CONSENTMENT_TEXTS } from "../../../utils";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { BoxTitle } from "../../../components/box";
import ExpandComponent from "../../../components/ExpandComponent";
import { setYoung } from "../../../redux/auth/actions";
import { appURL } from "../../../config";
import InfoIcon from "../../../assets/InfoIcon";
import pen from "../../../assets/pen.svg";

export default function StepDone() {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("YOUNG", young);
  }, []);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }
  return (
    <Container>
      <Info>
        <h3>INSCRIPTION AU SNU</h3>
        <h1>Vous y êtes presque !</h1>
        <p>
          Vous êtes sur le point de soumettre votre dossier à l&apos;administration du SNU. Veuillez vérifier vos informations avant de valider votre demande d&apos;inscription.
        </p>
        <InfosContainer>
          <Bloc title="Mon profil" profile>
            <Details title="Nom" value={young.lastName} />
            <Details title="Prénom" value={young.firstName} />
            <Details title="Sexe" value={young.gender} />
            <Details title="Date de naissance" value={`${formatStringDate(young.birthdateAt)} • ${getAge(young.birthdateAt)} ans`} />
            <Details title="Lieu de naissance" value={`${young.birthCity}, ${young.birthCityZip}`} />
            <Details title="Email" value={young.email} />
          </Bloc>
          <Bloc title="Mes coordonnées" to="/inscription/coordonnees">
            <Details title="Numéro de téléphone" value={young.phone} />
            <Details title="Adresse" value={young.address} />
            <Details title="Ville" value={young.city} />
            <Details title="Code Postal" value={young.zip} />
            {young.foreignAddress && (
              <Infos>
                <InfoIcon color="#32257F" />
                <p>
                  L&apos;adresse affichée ci-dessus est celle de votre hébergeur. <br /> Votre adresse à l&apos;étranger :
                  <br />
                  {[young.foreignAddress, young.foreignZip, young.foreignCity].join(", ")}
                  <br />
                  {young.foreignCountry}
                </p>
              </Infos>
            )}
            <Details title="Statut" value={t(young.situation)} />
            <Details title="Classe" value={t(young.grade)} />
            <Details title="Établissement" value={young.schoolName} />
            <Details title="Ville de l'établissement" value={young.schoolCity} />
          </Bloc>
          <Bloc title="Représentant légal n°1" to="/inscription/representants">
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
            <Bloc title="Représentant légal n°2" to="/inscription/representants">
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
          <Bloc title="Situations particulières" to="/inscription/particulieres">
            <Details title="Handicap" value={t(young.handicap)} />
            <Details title="Allergies" value={t(young.allergies)} />
            <Details title="PPS" value={t(young.ppsBeneficiary)} />
            <Details title="PAI" value={t(young.paiBeneficiary)} />
            <Details title="Aménagement spécifique" value={t(young.specificAmenagment) || "Non"} />
            <Details title="A besoin d'un aménagement pour mobilité réduite" value={t(young.reducedMobilityAccess) || "Non"} />
            <Details title="Doit être affecté dans son département de résidence" value={t(young.handicapInSameDepartment) || "Non"} />
            <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
            <Details title="Doit être affecté dans son département de résidence (activité de haut niveau)" value={t(young.highSkilledActivityInSameDepartment) || "Non"} />
          </Bloc>
          <Bloc title="Consentements" to="/inscription/consentements">
            <Details title={`Consentements validés par ${young.firstName} ${young.lastName}`} value={t(young.consentment || "false")} style={{ border: "none" }} />
            <ExpandComponent>
              <ul>
                {CONSENTMENT_TEXTS?.young?.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </ExpandComponent>
            <Details title="Consentements validés par ses représentants légaux" value={t(young.parentConsentment || "false")} style={{ border: "none" }} />
            <ExpandComponent>
              <ul>
                {CONSENTMENT_TEXTS?.parents?.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </ExpandComponent>
          </Bloc>
          <Bloc title="Disponibilités" to="/inscription/availability">
            <Infos>
              <p>
                Vous avez sélectionné le séjour : <strong>{young.cohort}</strong>
              </p>
            </Infos>
          </Bloc>
        </InfosContainer>
        <Formik
          initialValues={young}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              values.informationAccuracy = "true";
              values.aknowledgmentTerminaleSessionAvailability = "true";
              const { ok, code, data } = await api.put("/young", { ...values, status: YOUNG_STATUS.WAITING_VALIDATION });
              if (!ok) return toastr.error("Une erreur s'est produite :", t(code));
              toastr.success("Enregistré");
              dispatch(setYoung(data));
              await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_VALIDATION}`, { cta: `${appURL}/auth` });
              history.push("/");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", t(e.code));
            } finally {
              setLoading(false);
            }
          }}>
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <>
              <RadioLabel>
                <Field
                  validate={(v) => !v && requiredMessage}
                  value={"true"}
                  checked={values.informationAccuracy}
                  type="checkbox"
                  name="informationAccuracy"
                  onChange={handleChange}
                />
                <div>
                  Je, <b>{`${young.firstName} ${young.lastName}`}</b>, certifie l&apos;exactitude des renseignements fournis
                </div>
              </RadioLabel>
              <ErrorMessage errors={errors} touched={touched} name="informationAccuracy" />
              {["Terminale", "Terminale CAP"].includes(values.grade) ? (
                <>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      value={"true"}
                      checked={values.aknowledgmentTerminaleSessionAvailability}
                      type="checkbox"
                      name="aknowledgmentTerminaleSessionAvailability"
                      onChange={handleChange}
                    />
                    <div>
                      J’ai bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai pas
                      participer au séjour de cohésion entre le 3 et le 15 juillet 2022 (il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des
                      épreuves).
                    </div>
                  </RadioLabel>
                  <ErrorMessage errors={errors} touched={touched} name="aknowledgmentTerminaleSessionAvailability" />
                </>
              ) : null}
              <ContinueButton onClick={handleSubmit}>
                {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Je valide mon dossier d'inscription au SNU"}
              </ContinueButton>
            </>
          )}
        </Formik>
      </Info>
      <div className="thumb" />
    </Container>
  );
}

const Bloc = ({ children, title, last, profile, to }) => {
  return (
    <Row style={{ borderBottom: last ? 0 : "2px solid #f4f5f7" }}>
      <Wrapper>
        <div className="bloc-title">
          <BoxTitle>{title}</BoxTitle>
          {!profile ? (
            <Link to={to}>
              <img src={pen} />
            </Link>
          ) : null}
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, style }) => {
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
      </section>
    </div>
  );
};

const InfosContainer = styled.section`
  @media (min-width: 1135px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

const Wrapper = styled.div`
  padding: 2rem;
  width: 100%;
  .bloc-title {
    display: flex;
  }
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
      text-align: right;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
  img {
    width: 1.5rem;
  }
`;

const Info = styled.div`
  flex: 1.5;
  padding: 5rem;
  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  h1 {
    color: #111827;
    font-size: 2rem;
    margin-block: 0.5rem 2rem;
  }

  h3 {
    text-transform: uppercase;
    color: #4f46e5;
    letter-spacing: 0.05em;
    font-size: 16px;
  }

  p {
    font-size: 1.1rem;
    color: #909090;
    margin: 0;
  }

  .btns {
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .back {
    display: flex;
    align-items: center;
    color: #6b7280;
    margin-bottom: 2rem;
    cursor: pointer;
    width: fit-content;
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
    font-size: 0.8rem;
    flex: 1;
    margin: 0;
  }
`;

const ContinueButton = styled.button`
  min-width: 110px;
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Container = styled.div`
  display: flex;
`;

const RadioLabel = styled.label`
  div {
    width: 100%;
  }
  display: flex;
  align-items: flex-start;
  color: #374151;
  font-size: 14px;
  margin-top: 2rem;
  margin-bottom: 0px;
  text-align: left;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    margin-top: 3px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;
