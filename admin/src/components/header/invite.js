import React, { useEffect, useState } from "react";
import { Modal, ModalHeader, ModalBody, Row, Col, FormGroup, Input } from "reactstrap";
import { Formik, Field } from "formik";
import styled from "styled-components";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import {
  colors,
  translate,
  departmentList,
  regionList,
  region2department,
  department2region,
  REFERENT_DEPARTMENT_SUBROLE,
  REFERENT_REGION_SUBROLE,
  ROLES,
  SENDINBLUE_TEMPLATES,
} from "../../utils";

import LoadingButton from "../../components/buttons/LoadingButton";
import api from "../../services/api";

export default function InviteHeader({ setOpen, open, label = "Inviter un référent" }) {
  const [centers, setCenters] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cohesion-center");
        const c = data.map((e) => ({ label: e.name, value: e.name, _id: e._id }));
        setCenters(c);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  const getSubRole = (role) => {
    let subRole = [];
    if (role === ROLES.REFERENT_DEPARTMENT) subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === ROLES.REFERENT_REGION) subRole = REFERENT_REGION_SUBROLE;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };
  return (
    <Invitation style={{ marginBottom: 10, textAlign: "right" }}>
      <Modal isOpen={open} toggle={() => setOpen(false)} size="lg">
        <Invitation>
          <ModalHeader toggle={() => setOpen(false)}>{label}</ModalHeader>
          <ModalBody>
            <Formik
              validateOnChange={false}
              validateOnBlur={false}
              initialValues={{
                firstName: "",
                lastName: "",
                role: "",
                subRole: "",
                email: "",
                region: "",
                department: "",
                cohesionCenterName: "",
                cohesionCenterId: "",
              }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const obj = { ...values };
                  if (obj.role === ROLES.REFERENT_DEPARTMENT) obj.region = department2region[obj.department];
                  if (obj.role === ROLES.REFERENT_REGION) obj.department = null;
                  if (obj.department && !obj.region) obj.region = department2region[obj.department];
                  await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[obj.role]}`, obj);
                  toastr.success("Invitation envoyée");
                  setOpen();
                  setOpen(false);
                } catch (e) {
                  console.log(e);
                  toastr.error("Erreur !", translate(e.code));
                }
                setSubmitting(false);
              }}>
              {({ values, handleChange, handleSubmit, isSubmitting, errors }) => (
                <React.Fragment>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Prénom</div>
                        <Field validate={(v) => !v} name="firstName" value={values.firstName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Nom</div>
                        <Field validate={(v) => !v} name="lastName" value={values.lastName} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <div>Email</div>
                        <Field validate={(v) => !v} name="email" value={values.email} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <FormGroup>
                        <div>Rôle</div>
                        <ChooseRole validate={(v) => !v} value={values.role} onChange={handleChange} />
                      </FormGroup>
                    </Col>
                  </Row>
                  {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.HEAD_CENTER].includes(values.role) ? (
                    <Row>
                      <>
                        <Col md={6}>
                          {values.role === ROLES.REFERENT_DEPARTMENT ? (
                            <FormGroup>
                              <div>Département</div>
                              <ChooseDepartment validate={(v) => !v} value={values.department} onChange={handleChange} />
                            </FormGroup>
                          ) : null}
                          {values.role === ROLES.REFERENT_REGION ? (
                            <FormGroup>
                              <div>Région</div>
                              <ChooseRegion validate={(v) => !v} value={values.region} onChange={handleChange} />
                            </FormGroup>
                          ) : null}
                          {values.role === ROLES.HEAD_CENTER ? (
                            <FormGroup>
                              <ChooseCenter validate={(v) => !v} value={values} onChange={handleChange} centers={centers} />
                            </FormGroup>
                          ) : null}
                        </Col>
                        {values.role !== ROLES.HEAD_CENTER && (
                          <Col md={6}>
                            <FormGroup>
                              <div>Fonction</div>
                              <ChooseSubRole validate={(v) => !v} value={values.subRole} onChange={handleChange} options={getSubRole(values.role)} />
                            </FormGroup>
                          </Col>
                        )}
                      </>
                    </Row>
                  ) : null}
                  <br />
                  <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                    Envoyer l&apos;invitation
                  </LoadingButton>
                  {Object.keys(errors).length ? <h3>Merci de remplir tous les champs avant d&apos;envoyer une invitation.</h3> : null}
                </React.Fragment>
              )}
            </Formik>
          </ModalBody>
        </Invitation>
      </Modal>
    </Invitation>
  );
}

const ChooseDepartment = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);
  const [list, setList] = useState(departmentList);

  useEffect(() => {
    //force the value if it is a referent_department
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return onChange({ target: { value: user.department, name: "department" } });
    }
    //filter the array if it is a referent_region
    if (user.role === ROLES.REFERENT_REGION) {
      setList(region2department[user.region]);
    }
  }, []);

  return (
    <Field
      disabled={user.role === ROLES.REFERENT_DEPARTMENT}
      as="select"
      validate={validate}
      className="form-control"
      placeholder="Département"
      name="department"
      value={value}
      onChange={onChange}>
      <option disabled value="" label=""></option>
      {list.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Field>
  );
};

const ChooseRegion = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === ROLES.REFERENT_REGION) {
      return onChange({ target: { value: user.region, name: "region" } });
    }
  }, []);

  return (
    <Field
      disabled={user.role === ROLES.REFERENT_REGION}
      as="select"
      validate={validate}
      className="form-control"
      placeholder="Région"
      name="region"
      value={value}
      onChange={onChange}>
      <option key={-1} value="" label=""></option>
      {regionList.map((e) => {
        return (
          <option value={e} key={e}>
            {e}
          </option>
        );
      })}
    </Field>
  );
};

const ChooseCenter = ({ onChange, centers, onSelect }) => {
  const { user } = useSelector((state) => state.Auth);

  useEffect(() => {
    if (user.role === ROLES.HEAD_CENTER) {
      return onChange({ target: { value: user.cohesionCenterId, name: "cohesionCenterId" } }), onChange({ target: { value: user.cohesionCenterName, name: "cohesionCenterName" } });
    }
  }, []);

  return (
    <ReactSelect
      disabled={user.role === ROLES.HEAD_CENTER}
      options={centers}
      placeholder="Choisir un centre"
      noOptionsMessage={() => "Aucun centre ne correspond à cette recherche."}
      onChange={(e) => {
        onChange({ target: { value: e._id, name: "cohesionCenterId" } });
        onChange({ target: { value: e.value, name: "cohesionCenterName" } });
        onSelect?.(e);
      }}
    />
  );
};

const ChooseRole = ({ value, onChange, validate }) => {
  const { user } = useSelector((state) => state.Auth);

  return (
    <Field as="select" validate={validate} className="form-control" placeholder="Rôle" name="role" value={value} onChange={onChange}>
      <option value=""></option>
      <option value={ROLES.HEAD_CENTER}>{translate(ROLES.HEAD_CENTER)}</option>
      <option value={ROLES.REFERENT_DEPARTMENT}>{translate(ROLES.REFERENT_DEPARTMENT)}</option>
      {user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_REGION ? <option value={ROLES.REFERENT_REGION}>{translate(ROLES.REFERENT_REGION)}</option> : null}
      {user.role === ROLES.ADMIN ? <option value={ROLES.ADMIN}>{translate(ROLES.ADMIN)}</option> : null}
    </Field>
  );
};
const ChooseSubRole = ({ value, onChange, options }) => {
  return (
    <Input type="select" name="subRole" value={value} onChange={onChange}>
      <option value=""></option>
      {options.map((o, i) => (
        <option key={i} value={o.value} label={o.label}>
          {o.label}
        </option>
      ))}
    </Input>
  );
};

const Invitation = styled.div`
  input {
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  h3 {
    border: 1px solid ${colors.red};
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: ${colors.red};
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
    text-align: center;
  }
`;
