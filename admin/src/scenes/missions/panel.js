import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { Field, Formik } from "formik";

import { formatDay, translate } from "../../utils";

import api from "../../services/api";

export default ({ onChange, mission }) => {
  if (!mission) return <div />;
  return (
    <Panel>
      <div className="close" onClick={onChange} />
      <div className="name">{mission.structureName}</div>
      <div className="title">{mission.name}</div>
      <Link to={`/mission/${mission._id}`}>
        <button>Modifier</button>
      </Link>
      <hr />
      <div style={{ marginBottom: 20 }}>
        <Tag>{`${mission.department} - departmentNametodo`}</Tag>
      </div>
      <div className="detail">
        <div className="detail-title">Statut</div>
        <div className="detail-text">{translate(mission.status)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Format</div>
        <div className="detail-text">{translate(mission.format)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Début</div>
        <div className="detail-text">{formatDay(mission.date_start)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Fin</div>
        <div className="detail-text">{formatDay(mission.date_end)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Adresse</div>
        <div className="detail-text">{mission.city}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Domaines</div>
        <div className="detail-text">{mission.domains && mission.domains.join(", ")}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Max.</div>
        <div className="detail-text">{mission.placesTotal}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Détails</div>
        <div className="detail-text">{mission.description}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Actions</div>
        <div className="detail-text">{mission.actions}</div>
      </div>
      <div className="detail">
        <div className="detail-title">MIG</div>
        <div className="detail-text">{mission.justifications}</div>
      </div>
      <div>
        <Status mission={mission} />
      </div>
      {/* <div>
        {Object.keys(mission).map((e) => {
          return <div>{`${e}:${mission[e]}`}</div>;
        })}
      </div> */}
      {/* <div className="others-title">Volontaires (0)</div>
      <div className="others-text">Aucun volontaire n'a encore été assigné. // TODO</div> */}
    </Panel>
  );
};

const Status = ({ mission }) => {
  return (
    <StatusBox>
      <div className="title">Statut de la mission</div>
      <div className="subtitle">
        <img src={require("../../assets/information.svg")} height={14} />
        <span>Vous pourez selectionner le statut de la mission. A noter que des notifications emails seront envoyees.</span>
      </div>
      <Formik
        initialValues={{ status: mission.status }}
        onSubmit={async (values) => {
          try {
            await api.put(`/mission/${mission._id}`, values);
            toastr.success("Success");
          } catch (e) {
            toastr.error("Error");
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <div>
            <FormGroup>
              <label>statut</label>
              <Field name="status" component="select" rows={2} value={values.status} onChange={handleChange}>
                <option value="WAITING_VALIDATION">En attente de validation</option>
                <option value="WAITING_CORRECTION">En attente de correction</option>
                <option value="VALIDATED">Validée</option>
                <option value="DRAFT">Brouillon</option>
                <option value="REFUSED">Refusée</option>
                <option value="CANCEL">Annulée</option>
                <option value="ARCHIVED">Archivée</option>
              </Field>
            </FormGroup>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        )}
      </Formik>
    </StatusBox>
  );
};

const Tag = styled.span`
  background-color: rgb(253, 246, 236);
  border: 1px solid rgb(250, 236, 216);
  color: rgb(230, 162, 60);
  align-self: flex-start;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
`;

const Panel = styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 420px;
  position: relative;
  min-height: 100vh;
  font-size: 14px;
  align-self: flex-start;
  position: sticky;
  right: 0;
  border: 1px solid rgb(235, 238, 245);
  background-color: #fff;
  position: relative;
  text-align: center;
  border-radius: 4px;
  padding-bottom: 20px;
  margin-bottom: 40px;
  padding: 20px;
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${require("../../assets/close_icon.png")}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  .name {
    text-transform: uppercase;
    color: #606266;
    font-size: 12px;
    margin: 50px;
    text-align: center;
    letter-spacing: 0.02em;
  }
  :hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
  }
  img {
    width: 45px;
    height: 45px;
    background-color: #aaa;
    border-radius: 50%;
    object-fit: cover;
    transform: translateY(-50%);
  }
  .title {
    margin-top: -15px;
    margin-bottom: 15px;
    font-weight: 500;
    color: #000;
    font-size: 18px;
  }
  button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    align-self: flex-start;
    border-radius: 4px;
    padding: 5px;
    font-size: 12px;
    width: 100px;
    font-weight: 400;
    color: #646b7d;
    cursor: pointer;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  hr {
    margin: 20px 0 30px;
  }
  .detail {
    display: flex;
    align-items: center;
    font-size: 12px;
    text-align: left;
    &-title {
      min-width: 90px;
      width: 90px;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }

  .others-title {
    font-size: 20px;
    margin-bottom: 15px;
  }
  .others-text {
    font-size: 12px;
    color: #aeb7d6;
    padding: 15px;
  }
`;

const StatusBox = styled.div`
  margin: 30px 0;
  .title {
    color: #262a3e;
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 15px;
  }
  .subtitle {
    color: #a0afc0;
    font-size: 14px;
    display: flex;
    align-items: flex-start;
    margin: 15px 0;
    img {
      margin-right: 10px;
      margin-top: 5px;
    }
  }
`;
const FormGroup = styled.div`
  margin-bottom: 25px;
  > label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    padding-left: 15px;
  }
  select {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 10px 15px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const Button = styled.button`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
