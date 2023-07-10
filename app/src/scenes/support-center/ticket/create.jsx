import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink, useHistory } from "react-router-dom";
import plausibleEvent from "../../../services/plausible";
import api from "../../../services/api";
import { HeroContainer } from "../../../components/Content";
import FileUpload, { useFileUpload } from "../../../components/FileUpload";
import ErrorMessage, { requiredMessage } from "../../inscription2023/components/ErrorMessageOld";
import { SelectTag, step0, step1, step2Technical, step2Question, articles } from "./worflow";
import { translate, urlWithScheme } from "../../../utils";
import { capture } from "../../../sentry";
import Unlock from "../../../assets/icons/Unlock";
import QuestionBubble from "../../../assets/icons/QuestionBubble";
import ChevronRight from "../../../assets/icons/ChevronRight";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default function TicketCreate(props) {
  const { files, addFiles, deleteFile, error } = useFileUpload();
  const [isLoading, setLoading] = useState(false);
  const [answerNotFound, setAnswerNotFound] = useState(false);
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);

  const fromPage = new URLSearchParams(props.location.search).get("from");

  useEffect(() => {
    if (error) {
      toastr.error(error, "");
    }
  }, [error]);

  const handleClick = () => {
    setAnswerNotFound(true);
    plausibleEvent("Besoin d'aide - Je n'ai pas trouve de reponse");
  };

  return (
    <Container>
      <BackButton to={`/besoin-d-aide`}>{"<"} Retour</BackButton>
      <Heading>
        <h4>Contacter quelqu&apos;un</h4>
        <p>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l&apos;un de vos référents ?</p>
      </Heading>

      {/* Links to Phase 1 page */}

      {["EXEMPTED", "DONE"].includes(young?.statusPhase1) && (
        <div className="mx-auto mb-3 flex w-full flex-col gap-4 md:w-4/5 md:min-w-[700px] md:max-w-[1000px] md:flex-row">
          <div className="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-2 shadow-md hover:shadow-lg" onClick={() => history.push("/phase1")}>
            <div className="w-12">
              <Unlock style={{ transform: "scale(0.7)" }} />
            </div>
            <div className="grow text-sm font-bold">Débloquez votre accès gratuit au code de la route</div>
            <ChevronRight className="mr-1 w-4 scale-[200%] fill-gray-300 stroke-white" />
          </div>
          <div className="flex cursor-pointer items-center gap-2 rounded-lg bg-white p-2 shadow-md hover:shadow-lg" onClick={() => history.push("/phase1")}>
            <div className="ml-1 w-11">
              <QuestionBubble />
            </div>
            <div className="text-sm font-bold">Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?</div>
            <ChevronRight className="mr-1 w-4 scale-[200%] fill-gray-300 stroke-white" />
          </div>
        </div>
      )}

      <Form>
        <Formik
          initialValues={{ step0: null, step1: null, step2: null, message: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              let uploadedFiles;
              if (files.length > 0) {
                const filesResponse = await api.uploadFiles("/zammood/upload", files);
                if (!filesResponse.ok) {
                  setLoading(false);
                  const translationKey = filesResponse.code === "FILE_SCAN_DOWN" ? "FILE_SCAN_DOWN_SUPPORT" : filesResponse.code;
                  return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(translationKey), { timeOut: 5000 });
                }
                uploadedFiles = filesResponsapi.uploadFiles;
              }
              const { message, step0, step1, step2 } = values;
              const title = `${step1?.label} - ${step2?.label}`;
              const response = await api.post("/zammood/ticket", {
                message,
                subject: title,
                fromPage,
                subjectStep0: step0?.id,
                subjectStep1: step1?.id,
                subjectStep2: step2?.id,
                files: uploadedFiles,
              });
              if (!response.ok) {
                setLoading(false);
                return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(response.code));
              }
              toastr.success("Demande envoyée");
              history.push("/besoin-d-aide");
            } catch (e) {
              capture(e);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            } finally {
              setLoading(false);
            }
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => {
            const showForm = (values.step2?.id !== undefined && values.step2.id !== "PHASE_1_WITHDRAWAL") || answerNotFound === true;
            return (
              <>
                <SelectTag
                  name="step0"
                  options={Object.values(step0)}
                  title={"Je suis"}
                  selectPlaceholder={"Choisir mon rôle"}
                  handleChange={handleChange}
                  value={values?.step0?.id}
                  values={values}
                  errors={errors}
                  touched={touched}
                />
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
                    options={Object.entries(step2Technical)
                      .filter(([key]) => key !== "CONNECTION")
                      .map(([key, value]) => ({ id: key, ...value }))}
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

                {values.step2?.id === "PHASE_1_WITHDRAWAL" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3 pt-10">
                      {articles?.map((article) => (
                        <a
                          className="bg-white rounded-xl p-3 flex flex-col gap-2 border-2 text-sm hover:border-blue-500 hover:text-gray-800 transition group"
                          href={urlWithScheme(article.url)}
                          target="_blank"
                          rel="noreferrer"
                          key={article.url}>
                          <p className="flex gap-2 font-semibold">
                            {article.emoji} {article.title}
                          </p>
                          <p className="">{article.body}</p>
                          <p className="mt-auto text-right text-blue-600 group-hover:underline underline-offset-4 decoration-2 transition-all">Lire la suite</p>
                        </a>
                      ))}
                    </div>

                    <button onClick={handleClick} className="text-blue-600 hover:underline underline-offset-4 decoration-2 mx-3 my-6 text-left">
                      Contacter quelqu'un
                    </button>
                  </>
                )}

                {showForm && (
                  <>
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
                    <FileUpload
                      disabled={isLoading}
                      className="px-[15px]"
                      files={files}
                      addFiles={addFiles}
                      deleteFile={deleteFile}
                      filesAccepted={["jpeg", "png", "pdf", "word", "excel"]}
                    />
                    <div className="mt-[15px] ml-[15px] flex flex-col md:flex-row">
                      <LoadingButton loading={isLoading} type="submit" style={{ maxWidth: "150px" }} onClick={handleSubmit} disabled={isSubmitting}>
                        Envoyer
                      </LoadingButton>
                      {isLoading && files.length > 0 && <div className="mt-2 text-sm text-gray-500 md:ml-4 md:mt-0">{translate("UPLOAD_IN_PROGRESS")}</div>}
                    </div>
                  </>
                )}
              </>
            );
          }}
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
