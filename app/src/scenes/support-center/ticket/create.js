import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink, useHistory } from "react-router-dom";

import api from "../../../services/api";
import { HeroContainer } from "../../../components/Content";
import FileUpload, { useFileUpload } from "../../../components/FileUpload";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import { SelectTag, step1, step2Technical, step2Question } from "./worflow";
import { translate } from "../../../utils";
import { capture } from "../../../sentry";
import Unlock from "../../../assets/icons/Unlock";
import QuestionBubble from "../../../assets/icons/QuestionBubble";
import ChevronRight from "../../../assets/icons/ChevronRight";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default function TicketCreate(props) {
  const { files, addFiles, deleteFile, error } = useFileUpload();
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const tags = [`COHORTE_${young.cohort}`, `DEPARTEMENT_${young.department}`, `REGION_${young.region}`, `EMETTEUR_Volontaire`, `CANAL_Plateforme`, `AGENT_Startup_Support`];
  const fromPage = new URLSearchParams(props.location.search).get("from");

  useEffect(() => {
    if (error) {
      toastr.error(error, "");
    }
  }, [error]);

  return (
    <Container>
      <BackButton to={`/besoin-d-aide`}>{"<"} Retour à l&apos;accueil</BackButton>
      <Heading>
        <h4>Contacter quelqu&apos;un</h4>
        <p>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l&apos;un de vos référents ?</p>
      </Heading>

      {/* Links to Phase 1 page */}

      {["EXEMPTED", "DONE"].includes(young?.statusPhase1) && (
        <div className="mx-auto mb-3 gap-4 flex flex-col w-full md:flex-row md:w-4/5 md:max-w-[1000px] md:min-w-[700px]">
          <div className="flex items-center p-2 gap-2 rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg" onClick={() => history.push("/phase1")}>
            <div className="w-12">
              <Unlock style={{ transform: "scale(0.7)" }} />
            </div>
            <div className="text-sm font-bold grow">Débloquez votre accès gratuit au code de la route</div>
            <ChevronRight className="scale-[200%] stroke-white fill-gray-300 w-4 mr-1" />
          </div>
          <div className="flex items-center p-2 gap-2 rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg" onClick={() => history.push("/phase1")}>
            <div className="ml-1 w-11">
              <QuestionBubble />
            </div>
            <div className="text-sm font-bold">Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?</div>
            <ChevronRight className="scale-[200%] stroke-white fill-gray-300 w-4 mr-1" />
          </div>
        </div>
      )}

      <Form>
        <Formik
          initialValues={{ step1: null, step2: null, message: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              let uploadedFiles;
              if (files.length > 0) {
                const filesResponse = await api.uploadFile("/zammood/upload", files);
                if (!filesResponse.ok) {
                  setLoading(false);
                  return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(filesResponse.code));
                }
                uploadedFiles = filesResponse.data;
              }
              const { message, step1, step2 } = values;
              const title = `${step1?.label} - ${step2?.label}`;
              const response = await api.post("/zammood/ticket", {
                message,
                subject: title,
                fromPage,
                subjectStep1: step1?.id,
                subjectStep2: step2?.id,
                files: uploadedFiles,
              });
              if (!response.ok) {
                setLoading(false);
                return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(response.code));
              }
              setLoading(false);
              toastr.success("Demande envoyée");
              history.push("/besoin-d-aide");
            } catch (e) {
              capture(e);
              setLoading(false);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <SelectTag
                name="step1"
                options={Object.values(step1)}
                title={"Ma demande"}
                selectPlaceholder={"Choisir la catégorie"}
                handleChange={handleChange}
                value={values?.step1?.id}
                values={values}
                errors={errors}
                touched={touched}
              />
              {values.step1?.id === "TECHNICAL" ? (
                <SelectTag
                  name="step2"
                  options={Object.values(step2Technical)}
                  title={"Sujet"}
                  selectPlaceholder={"Choisir le sujet"}
                  handleChange={handleChange}
                  value={values.step2?.id}
                  values={values}
                  errors={errors}
                  touched={touched}
                />
              ) : null}
              {values.step1?.id === "QUESTION" ? (
                <SelectTag
                  name="step2"
                  options={Object.values(step2Question)}
                  title={"Sujet"}
                  selectPlaceholder={"Choisir le sujet"}
                  handleChange={handleChange}
                  value={values.step2?.id}
                  values={values}
                  errors={errors}
                  touched={touched}
                />
              ) : null}
              <Item
                name="message"
                title="Mon message"
                type="textarea"
                value={values.message}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
                rows="5"
              />
              <FileUpload className="px-[15px]" files={files} addFiles={addFiles} deleteFile={deleteFile} filesAccepted={["jpeg", "png", "pdf", "word", "excel"]} />
              <LoadingButton loading={isLoading} type="submit" style={{ marginLeft: 10, maxWidth: "150px", marginTop: 15 }} onClick={handleSubmit} disabled={isSubmitting}>
                Envoyer
              </LoadingButton>
              {/* {isLoading ? (
                <StyledLoader size="30px" />
              ) : (
                <ContinueButton type="submit" style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting}>
                  Envoyer
                </ContinueButton>
              )} */}
            </>
          )}
        </Formik>
      </Form>
    </Container>
  );
}

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option value="" disabled>
            Catégorie
          </option>
          {options?.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const BackButton = styled(NavLink)`
  color: #666;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const Container = styled(HeroContainer)`
  display: flex;
  margin-top: -1rem;
  flex-direction: column;
`;

const Heading = styled.header`
  font-size: 3rem;
  display: flex;
  padding: 2rem;
  flex-direction: column;
  margin: 0 auto;
  width: clamp(700px, 80%, 1000px);
  @media (max-width: 767px) {
    width: 100%;
  }

  p {
    font-size: 1rem;
    color: #6b7280;
  }
  @media (max-width: 767px) {
    padding: 1.2rem;
    p {
      font-size: 1rem;
      color: #6b7280;
    }
  }
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Form = styled.div`
  display: flex;
  flex: 2;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  background-color: #fff;
  margin: 0 auto;
  width: clamp(700px, 80%, 1000px);
  @media (max-width: 767px) {
    width: 100%;
  }
`;
