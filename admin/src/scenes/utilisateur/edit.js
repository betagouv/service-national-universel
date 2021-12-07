import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import ReactSelect from "react-select";

import { Box, BoxContent, BoxHeadTitle } from "../../components/box";
import LoadingButton from "../../components/buttons/LoadingButton";
import DateInput from "../../components/dateInput";
import { departmentList, regionList, department2region, translate, ROLES, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE, colors } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import Loader from "../../components/Loader";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import { setUser as ReduxSetUser } from "../../redux/auth/actions";
import Emails from "../../components/views/Emails";
import HistoricComponent from "../../components/views/Historic";
import ModalConfirm from "../../components/modals/ModalConfirm";
import { requiredMessage } from "../../components/errorMessage";

export default function Edit(props) {
  const [user, setUser] = useState();
  const [service, setService] = useState();
  const [centers, setCenters] = useState();
  const [structures, setStructures] = useState();
  const [structure, setStructure] = useState();
  const [loadingChangeStructure, setLoadingChangeStructure] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const currentUser = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const id = props.match && props.match.params && props.match.params.id;
        if (!id) return setUser(null);
        const { ok, data } = await api.get(`/referent/${id}`);
        if (!ok) return setUser(null);
        setUser(data);
        const { data: d } = await api.get(`/department-service/${data.department}`);
        setService(d);
        const responseStructure = await api.get("/structure");
        const s = responseStructure.data.map((e) => ({ label: e.name, value: e.name, _id: e._id }));
        data.structureId ? setStructure(s.find((struct) => struct._id === data.structureId)) : null;
        setStructures(s);
        const responseCenter = await api.get(`/cohesion-center`);
        const c = responseCenter.data.map((e) => ({ label: e.name, value: e.name, _id: e._id }));
        setCenters(c);
      } catch (e) {
        console.log(e);
        return toastr.error("Une erreur s'est produite lors du chargement de cet utilisateur");
      }
    })();
  }, []);

  if (user === undefined || service === undefined) return <Loader />;

  const getSubtitle = () => {
    const createdAt = new Date(user.createdAt);
    dayjs.extend(relativeTime).locale("fr");
    const diff = dayjs(createdAt).fromNow();
    return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
  };

  const clearDepartmentAndRegion = (handleChange) => {
    handleChange({ target: { name: "region", value: "" } });
    handleChange({ target: { name: "department", value: "" } });
  };

  const getSubRole = (role) => {
    let subRole = [];
    if (role === ROLES.REFERENT_DEPARTMENT) subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === ROLES.REFERENT_REGION) subRole = REFERENT_REGION_SUBROLE;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  async function modifyStructure() {
    try {
      setLoadingChangeStructure(true);
      const { ok, code } = await api.put(`/referent/${user._id}/structure/${structure._id}`);
      setLoadingChangeStructure(false);
      if (!ok)
        return code === "OPERATION_NOT_ALLOWED"
          ? toastr.error(translate(code), "Ce responsable est affilié comme tuteur de missions de la structure.", { timeOut: 5000 })
          : toastr.error(translate(code), "Une erreur s'est produite lors de la modification de la structure.");
      toastr.success("Structure modifiée");
      history.go(0);
    } catch (e) {
      setLoadingChangeStructure(false);
      return toastr.error("Une erreur s'est produite lors de la modification de la structure", e?.error?.message);
    }
  }

  function canModify(user, value) {
    if (user.role === ROLES.ADMIN) return true;
    // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    if (user.role === ROLES.REFERENT_REGION) {
      if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(value.role) && user.region === value.region) return true;
      return false;
    }
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      if (user.role === value.role && user.department === value.department) return true;
      return false;
    }
    return false;
  }

  const handleImpersonate = async () => {
    try {
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${user._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !");
      history.push("/dashboard");
      if (token) api.setToken(token);
      if (data) dispatch(ReduxSetUser(data));
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(),
      title: "Êtes-vous sûr(e) de vouloir supprimer ce profil ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${user._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce profil a été supprimé.");
      return history.push(`/user`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  return (
    <Wrapper>
      <Formik
        initialValues={user}
        onSubmit={async (values) => {
          try {
            // if structure has changed but no saved
            if (
              user.structureId !== structure?._id &&
              !confirm(
                'Attention, vous avez modifié la structure de cet utilisateur sans valider. Si vous continuez, ce changement de structure ne sera pas pris en compte. Pour valider ce changement, cliquez sur annuler et valider en cliquant sur "Modifier la structure".',
              )
            )
              return;
            const { ok, code, data } = await api.put(`/referent/${values._id}`, values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            setUser(data);
            toastr.success("Utilisateur mis à jour !");
            history.go(0);
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil Utilisateur de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <div style={{ display: "flex" }}>
                {values.structureId ? (
                  <Link to={`/structure/${values.structureId}`}>
                    <PanelActionButton icon="eye" title="Voir la structure" />
                  </Link>
                ) : null}
                {currentUser.role === ROLES.ADMIN ? <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" /> : null}
                <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer
                </SaveBtn>
              </div>
            </TitleWrapper>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Identité</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Item title="Nom" values={values} name={"lastName"} handleChange={handleChange} />
                    <Item title="Prénom" values={values} name="firstName" handleChange={handleChange} />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxHeadTitle>Coordonnées</BoxHeadTitle>
                  <BoxContent direction="column">
                    <Item title="E-mail" values={values} name="email" handleChange={handleChange} />
                    <Item title="Tel. fixe" values={values} name="phone" handleChange={handleChange} />
                    <Item title="Tel. mobile" values={values} name="mobile" handleChange={handleChange} />
                  </BoxContent>
                </Box>
              </Col>
              {canModify(currentUser, values) && (
                <Col md={6} style={{ marginBottom: "20px" }}>
                  <Box>
                    <BoxHeadTitle>Information</BoxHeadTitle>
                    <BoxContent direction="column">
                      <Select
                        name="role"
                        disabled={currentUser.role !== ROLES.ADMIN}
                        values={values}
                        onChange={(e) => {
                          const value = e.target.value;
                          clearDepartmentAndRegion(handleChange);
                          handleChange({ target: { name: "role", value } });
                        }}
                        allowEmpty={false}
                        title="Rôle"
                        options={[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.HEAD_CENTER].map((key) => ({
                          value: key,
                          label: translate(key),
                        }))}
                      />
                      {values.role === ROLES.HEAD_CENTER ? (
                        centers ? (
                          <AutocompleteSelectCenter
                            options={centers}
                            defaultValue={{ label: values.cohesionCenterName, value: values.cohesionCenterName, _id: values.cohesionCenterId }}
                            onChange={(e) => {
                              handleChange({ target: { value: e._id, name: "cohesionCenterId" } });
                              handleChange({ target: { value: e.value, name: "cohesionCenterName" } });
                            }}
                          />
                        ) : (
                          <Loader />
                        )
                      ) : null}
                      {values.role === ROLES.RESPONSIBLE ? (
                        structures ? (
                          <AutocompleteSelectStructure
                            options={structures}
                            structure={structure}
                            setStructure={(e) => {
                              setStructure(e);
                            }}
                            userId={user._id}
                            onClick={modifyStructure}
                            disabled={isSubmitting}
                            loading={loadingChangeStructure}
                          />
                        ) : (
                          <Loader />
                        )
                      ) : null}
                      {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(values.role) ? (
                        <Select name="subRole" values={values} onChange={handleChange} title="Fonction" options={getSubRole(values.role)} />
                      ) : null}
                      {values.role === ROLES.REFERENT_DEPARTMENT ? (
                        <Select
                          disabled={currentUser.role !== ROLES.ADMIN}
                          name="department"
                          values={values}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { name: "department", value } });
                            const region = department2region[value];
                            handleChange({ target: { name: "region", value: region } });
                          }}
                          title="Département"
                          options={departmentList.map((d) => ({ value: d, label: d }))}
                        />
                      ) : null}
                      {values.role === ROLES.REFERENT_REGION ? (
                        <Select
                          disabled={values.role === ROLES.REFERENT_DEPARTMENT}
                          name="region"
                          values={values}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleChange({ target: { name: "region", value } });
                            handleChange({ target: { name: "department", value: "" } });
                          }}
                          title="Région"
                          options={regionList.map((r) => ({ value: r, label: r }))}
                        />
                      ) : null}
                    </BoxContent>
                  </Box>
                </Col>
              )}
            </Row>
          </>
        )}
      </Formik>
      <Emails email={user.email} />
      {currentUser.role === ROLES.ADMIN ? (
        <Box>
          <div style={{ fontSize: ".9rem", padding: "1rem", color: colors.darkPurple }}>Historique</div>
          <HistoricComponent model="referent" value={user} />
        </Box>
      ) : null}
      {currentUser.role === ROLES.ADMIN ||
      ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(currentUser.role) && [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) ? (
        <DeleteBtn onClick={onClickDelete}>{`Supprimer le compte de ${user.firstName} ${user.lastName}`}</DeleteBtn>
      ) : null}
      {canModify(currentUser, user) && user.role === ROLES.REFERENT_DEPARTMENT && (
        <Formik
          initialValues={service || { department: user.department }}
          onSubmit={async (values) => {
            try {
              const { ok, code, data } = await api.post(`/department-service`, values);
              if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
              setService(data);
              toastr.success("Service departemental mis à jour !");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting }) => (
            <>
              <TitleWrapper>
                <div>
                  <Title>Information du service départemental {values.department && `(${values.department})`}</Title>
                </div>
                <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer
                </SaveBtn>
              </TitleWrapper>
              <Row>
                <Col md={6} style={{ marginBottom: "20px" }}>
                  <Box>
                    <BoxHeadTitle>{`Service Départemental`}</BoxHeadTitle>
                    <BoxContent direction="column">
                      <Item title="Nom de la direction" values={values} name="directionName" handleChange={handleChange} />
                      <Item title="Adresse" values={values} name="address" handleChange={handleChange} />
                      <Item title="Complément d'adresse" values={values} name="complementAddress" handleChange={handleChange} />
                      <Item title="Code postal" values={values} name="zip" handleChange={handleChange} />
                      <Item title="Ville" values={values} name="city" handleChange={handleChange} />
                    </BoxContent>
                    <BoxHeadTitle>Contact convocation</BoxHeadTitle>
                    <BoxContent direction="column">
                      <Item title="Nom du Contact" values={values} name="contactName" handleChange={handleChange} />
                      <Item title="Tel." values={values} name="contactPhone" handleChange={handleChange} />
                      <Item title="Email" values={values} name="contactMail" handleChange={handleChange} />
                    </BoxContent>
                  </Box>
                </Col>
              </Row>
            </>
          )}
        </Formik>
      )}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </Wrapper>
  );
}

const Item = ({ title, values, name, handleChange, type = "text", disabled = false }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field
            hidden
            validate={(v) => {
              if (!v) return requiredMessage;
              const from = new Date(2003, 6, 2); // -1 because months are from 0 to 11
              const to = new Date(2006, 3, 20);
              const [y, m, d] = v.substring(0, 10).split("-");
              const check = new Date(Date.UTC(parseInt(y), parseInt(m - 1), parseInt(d)));
              return (check < from || check > to) && "Vous n'avez pas l'âge requis pour vous inscrire au SNU";
            }}
            name="birthdateAt"
            value={values.birthdateAt}
          />
          <DateInput
            value={values.birthdateAt}
            onChange={(date) => {
              handleChange({ target: { value: date, name: "birthdateAt" } });
            }}
          />
        </>
      );
    }
    return <Field disabled={disabled} className="form-control" value={translate(values[name])} name={name} onChange={handleChange} type={type} />;
  };
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>{renderInput()}</Col>
    </Row>
  );
};

const Select = ({ title, name, values, onChange, disabled, options, allowEmpty = true }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={onChange}>
          {allowEmpty && <option key={-1} value="" label=""></option>}
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </Col>
    </Row>
  );
};

const AutocompleteSelectCenter = ({ options, defaultValue, onChange }) => {
  return (
    <Row className="detail">
      <Col md={4} style={{ alignSelf: "flex-start" }}>
        <label>{"Centre"}</label>
      </Col>
      <Col md={8}>
        <ReactSelect
          styles={{
            menu: () => ({
              borderStyle: "solid",
              borderWidth: 1,
              borderRadius: 5,
              borderColor: "#dedede",
            }),
          }}
          defaultValue={defaultValue}
          options={options}
          placeholder="Choisir un centre"
          noOptionsMessage={() => "Aucun centre ne correspond à cette recherche."}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

const AutocompleteSelectStructure = ({ options, structure, setStructure, onClick, disabled, loading }) => {
  return (
    <>
      <Row className="detail">
        <Col md={4} style={{ alignSelf: "flex-start" }}>
          <label>{"Structure"}</label>
        </Col>
        <Col md={8} style={{ alignSelf: "flex-start", display: "flex", alignItems: "flex-end", flexDirection: "column" }}>
          <ReactSelect
            styles={{
              container: () => ({ width: "100%" }),
              menu: () => ({
                borderStyle: "solid",
                borderWidth: 1,
                borderRadius: 5,
                borderColor: "#dedede",
              }),
            }}
            defaultValue={structure}
            options={options}
            placeholder="Choisir une structure"
            noOptionsMessage={() => "Aucun structure ne correspond à cette recherche."}
            onChange={(e) => {
              setStructure(e);
            }}
          />
          <LoadingButton
            onClick={() => {
              onClick();
            }}
            loading={loading}
            disabled={disabled}
            style={{
              marginTop: "1rem",
              marginLeft: "0",
              padding: "7px 20px",
            }}>
            Modifier la structure
          </LoadingButton>
        </Col>
      </Row>
    </>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;

// Title line with filters
const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;
const SubTitle = styled.h2`
  color: #242526;
  font-size: 1rem;
  font-weight: 300;
`;

const DeleteBtn = styled.button`
  background-color: #bd2130;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #dc3545;
  }
`;

const SaveBtn = styled(LoadingButton)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
  &.outlined {
    :hover {
      background: #fff;
    }
    background-color: transparent;
    border: solid 1px #5245cc;
    color: #5245cc;
    font-size: 13px;
    padding: 4px 20px;
  }
`;
