import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { Field, Formik } from "formik";

import { formatDay, translate, formatStringDate } from "../../utils";

import api from "../../services/api";
import SelectStatusMission from "../../components/selectStatusMission";

export default ({ onChange, mission }) => {
  const [tutor, setTutor] = useState();
  const [structure, setStructure] = useState({});

  useEffect(() => {
    (async () => {
      if (!mission) return;
      if (mission.tutorId) {
        const { ok: ok1, data: dataTutor, code: code1 } = await api.get(`/referent/${mission.tutorId}`);
        if (!ok1) toastr.error("Oups, une erreur est survnue lors de la récuperation du tuteur", translate(code1));
        else setTutor(dataTutor);
      } else {
        setTutor(null);
      }
      const { ok: ok2, data: dataStructure, code: code2 } = await api.get(`/structure/${mission.structureId}`);
      if (!ok2) toastr.error("Oups, une erreur est survnue lors de la récuperation de la structure", translate(code2));
      else setStructure(dataStructure);
      return;
    })();
  }, [mission]);

  if (!mission) return <div />;
  return (
    <Panel>
      <div style={{ display: "flex", marginBottom: "15px" }}>
        <Subtitle>MISSION</Subtitle>
        <div className="close" onClick={onChange} />
      </div>
      <div className="title">{mission.name}</div>
      <Link to={`/mission/${mission._id}`}>
        <Button className="btn-blue">Consulter</Button>
      </Link>
      <Link to={`/mission/${mission._id}/edit`}>
        <Button className="btn-blue">Modifier</Button>
      </Link>
      <Link to={`/mission/${mission._id}`}>
        <Button className="btn-red">Supprimer</Button>
      </Link>
      <hr />
      <div>
        <div className="title">Statut</div>
        <SelectStatusMission hit={mission} />
        <div className="description">A noter que des notifications emails seront envoyées</div>
      </div>
      <hr />
      <div className="title">{`Volontaire(s) (${mission.placesTotal - mission.placesLeft})`}</div>
      <div className="detail">
        <div className="description">{`Cette mission a reçu ${mission.placesTotal - mission.placesLeft} candidature(s)`}</div>
      </div>
      {/* <Link to={``}>
        <button>Consulter tous les volontaires</button>
      </Link> */}
      <hr />
      <div className="title">
        La structure
        <Link to={`/structure/${structure._id}`}>
          <SubtitleLink>{`${structure.name} >`}</SubtitleLink>
        </Link>
      </div>

      <div className="detail">
        <div className="detail-title">Statut</div>
        <div className="detail-text">{translate(structure.legalStatus)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Dép.</div>
        <div className="detail-text">{structure.department}</div>
      </div>

      <div className="detail">
        <div className="detail-title">Tuteur</div>
        <div className="detail-text">{tutor ? `${tutor.firstName} ${tutor.lastName}` : ""}</div>
      </div>
      <div className="detail">
        <div className="detail-title">E-mail</div>
        <div className="detail-text">{tutor && tutor.email}</div>
      </div>
      <div className="detail">
        <div className="detail-title">tel.</div>
        <div className="detail-text">{tutor && tutor.phone}</div>
      </div>
      <hr />
      <div className="title">La mission</div>
      <div className="detail">
        <div className="detail-title">Domaines</div>
        <div className="detail-text">{mission.domains.map((d) => translate(d)).join(", ")}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Début</div>
        <div className="detail-text">{formatStringDate(mission.startAt)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Fin</div>
        <div className="detail-text">{formatStringDate(mission.endAt)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Adresse</div>
        <div className="detail-text">{mission.address}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Dép.</div>
        <div className="detail-text">{mission.department}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Format</div>
        <div className="detail-text">{translate(mission.format)}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Fréquence</div>
        <div className="detail-text">{mission.frequence}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Périodes</div>
        <div className="detail-text">{mission.period.map((p) => translate(p)).join(", ")}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Objectifs</div>
        <div className="detail-text">{mission.description}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Actions</div>
        <div className="detail-text">{mission.actions}</div>
      </div>
      <div className="detail">
        <div className="detail-title">Contraintes</div>
        <div className="detail-text">{mission.contraintes}</div>
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
      <div className="title">Statut</div>
      <Formik
        initialValues={{ status: mission.status }}
        onSubmit={async (values) => {
          try {
            await api.put(`/mission/${mission._id}`, values);
            toastr.success("Success");
          } catch (e) {
            toastr.error("Erreur !");
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <div>
            <FormGroup>
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
            <div className="description">A noter que des notifications emails seront envoyées</div>
          </div>
        )}
      </Formik>
    </StatusBox>
  );
};

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.9rem;
`;

const SubtitleLink = styled(Subtitle)`
  color: #5245cc;
  text-transform: none;
`;

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
  .description {
    font-weight: 400;
    color: #aaa;
    font-size: 0.8rem;
  }
  hr {
    margin: 20px 0 30px;
  }
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 12px;
    text-align: left;
    margin-top: 1rem;
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
  margin: 0 0.5rem;
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  min-width: 100px;
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-blue {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  &.btn-red {
    border: 1px solid #f6cccf;
    color: rgb(206, 90, 90);
    :hover {
      border-color: rgb(240, 218, 218);
      background-color: rgb(250, 230, 230);
    }
  }
`;
