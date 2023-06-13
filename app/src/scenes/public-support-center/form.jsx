import React, { useState, useEffect } from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import close from "../../assets/cancel.png";

import api from "../../services/api";
import { translate, departmentList, department2region } from "../../utils";
import LoadingButton from "../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../inscription2023/components/ErrorMessageOld";
import { SelectTag, step1Public, step2TechnicalPublic, step2QuestionPublic } from "../support-center/ticket/worflow";
import { capture } from "../../sentry";
import FileUpload, { useFileUpload } from "../../components/FileUpload";

export default function FormComponent({ setOpen, setSuccessMessage, fromPage }) {
  const [loading, setLoading] = useState(false);
  const { files, addFiles, deleteFile, error } = useFileUpload();

  useEffect(() => {
    if (error) {
      toastr.error(error, "");
    }
  }, [error]);

  return (
    <Form>
      <img src={close} onClick={() => setOpen(false)} />

      <Formik
        initialValues={{ step1: null, step2: null, message: "", subject: "", email: "", name: "", department: "" }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            let uploadedFiles;
            setLoading(true);
            if (files.length > 0) {
              const filesResponse = await api.uploadFile("/zammood/upload", files);
              if (!filesResponse.ok) {
                const translationKey = filesResponse.code === "FILE_SCAN_DOWN" ? "FILE_SCAN_DOWN_SUPPORT" : filesResponse.code;
                return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(translationKey), { timeOut: 5000 });
              }
              uploadedFiles = filesResponse.data;
            }

            const { message, subject, firstName, lastName, email, step1, step2, department } = values;
            const response = await api.post("/zammood/ticket/form", {
              message,
              subject: subject,
              firstName,
              lastName,
              email,
              department,
              subjectStep1: step1.id,
              subjectStep2: step2.id,
              region: department2region[department],
              role: "young exterior",
              fromPage,
              files: uploadedFiles,
            });

            setOpen(false);
            if (!response.ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(response.code));
            toastr.success("Ticket créé");
            setSuccessMessage("Votre demande a bien été envoyée ! Nous vous répondrons par mail.");
          } catch (e) {
            console.log(e);
            capture(e);
            toastr.error("Oups, une erreur est survenue", translate(e.code));
          } finally {
            setLoading(false);
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <Item
              name="lastName"
              title="Nom du volontaire"
              placeholder="Renseignez votre nom"
              type="input"
              value={values.lastName}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="firstName"
              title="Prénom du volontaire"
              placeholder="Renseignez votre prénom"
              type="input"
              value={values.firstName}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="email"
              title="Email"
              placeholder="Renseignez votre email"
              type="input"
              value={values.email}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="department"
              type="select"
              placeholder="Sélectionnez votre département"
              values={values}
              value={values.department}
              handleChange={handleChange}
              title="Département"
              options={departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label))}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
            />
            <SelectTag
              name="step1"
              options={Object.values(step1Public)}
              title={"Ma demande"}
              selectPlaceholder={"Choisir la catégorie"}
              handleChange={handleChange}
              values={values}
              value={values?.step1?.id}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
            />
            {values.step1?.id === "TECHNICAL" ? (
              <SelectTag
                name="step2"
                options={Object.values(step2TechnicalPublic)}
                title={"Précision"}
                selectPlaceholder={"Préciser"}
                handleChange={handleChange}
                values={values}
                value={values.step2?.id}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
              />
            ) : null}
            {values.step1?.id === "QUESTION" ? (
              <SelectTag
                name="step2"
                options={Object.values(step2QuestionPublic)}
                title={"Précision"}
                selectPlaceholder={"Préciser"}
                handleChange={handleChange}
                values={values}
                value={values.step2?.id}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
              />
            ) : null}
            <Item
              name="subject"
              title="Le sujet de ma demande"
              placeholder="Renseignez votre demande"
              type="input"
              value={values.subject}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="message"
              title="Mon message"
              placeholder="Votre message"
              type="textarea"
              value={values.message}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="5"
              infos="Merci d’apporter le plus de précisions possibles afin de faciliter le traitement de votre demande"
            />
            <FileUpload
              disabled={loading}
              className="px-[15px]"
              files={files}
              addFiles={addFiles}
              deleteFile={deleteFile}
              filesAccepted={["jpeg", "png", "pdf", "word", "excel"]}
            />
            <div className="mt-[15px] ml-[15px] flex flex-col md:flex-row">
              <LoadingButton loading={loading} type="submit" style={{ maxWidth: "150px" }} onClick={handleSubmit} disabled={isSubmitting}>
                Envoyer
              </LoadingButton>
              {loading && files.length > 0 && <div className="mt-2 text-sm text-gray-500 md:ml-4 md:mt-0">{translate("UPLOAD_IN_PROGRESS")}</div>}
            </div>
          </>
        )}
      </Formik>
    </Form>
  );
}

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, placeholder, infos, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {infos ? <div className="mb-2 overflow-hidden rounded bg-[#FEF9E7] p-2 text-sm italic text-[#7D6608]">{infos}</div> : null}
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option disabled value="" selected={!value} label={placeholder}>
            {placeholder}
          </option>
          {options?.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} placeholder={placeholder} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

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
  img {
    width: 1.5rem;
    align-self: flex-end;
    cursor: pointer;
  }
  @media (max-width: 767px) {
    width: 100%;
  }
`;
