import React, { useEffect, useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";

import MultiSelect from "../../components/Multiselect";

import { domains, translate } from "../../utils";
import api from "../../services/api";

export default (props) => {
  const [defaultValue, setDefaultValue] = useState();
  const [redirect, setRedirect] = useState(false);

  const structure = useSelector((state) => state.Auth.structure);

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setDefaultValue(null);
      const { data } = await api.get(`/mission/${id}`);
      setDefaultValue(data);
    })();
  }, []);

  if (defaultValue === undefined) return <div>Chargement...</div>;

  if (redirect) return <Redirect to="/mission" />;

  return (
    <Formik
      isInitialValid={false}
      initialValues={
        defaultValue || {
          placesTotal: 1,
          format: "CONTINUOUS",
          structureId: structure._id,
          structureName: structure.name,
          name: "",
          description: "",
          actions: "",
          justifications: "",
          contraintes: "",
          departement: "",
          tuteur: "",
        }
      }
      onSubmit={async (values) => {
        try {
          console.log("values", values);
          if (!values._id) {
            values.placesLeft = values.placesTotal;
            await api.post("/mission", values);
            return toastr.success("Mission créée");
          }
          //TODO PLACE TAKEN
          values.placesLeft = values.placesTotal - values.placesTaken;
          await api.put(`/mission/${values._id}`, values);
          return toastr.success("Mission mise à jour");
        } catch (e) {
          console.log(e);
          toastr.error("Erreur!");
        }
      }}
    >
      {({ values, handleChange, handleSubmit, isValid }) => (
        <Wrapper>
          <Subtitle>MISSION</Subtitle>
          <Title>{values._id ? "Édition" : "Création"}</Title>
          <Legend>Informations générales</Legend>
          <FormGroup>
            <label>
              <span>*</span>NOM DE VOTRE MISSION
            </label>
            <Field
              // validate={(v) => !v.length}
              value={values.name}
              onChange={handleChange}
              name="name"
              placeholder="Nom de votre mission"
            />
          </FormGroup>
          <FormGroup>
            <label>STRUCTURE RATTACHÉE</label>
            <Input disabled value={values.structureName} placeholder="Structure de la mission" />
          </FormGroup>
          <FormGroup>
            <label>DOMAINES</label>
            <MultiSelect value={values.domains} onChange={handleChange} name="domains" options={domains} placeholder="Sélectionner un ou plusieurs domains" />
          </FormGroup>
          <FormGroup>
            <label>NOMBRE DE VOLONTAIRES SUSCEPTIBLES D’ÊTRE ACCUEILLIS DE FAÇON CONCOMITANTE SUR CETTE MISSION</label>
            <p style={{ color: "#a0aec1", fontSize: 12 }}>Précisez ce nombre en fonction de vos contraintes logistiques et votre capacité à accompagner les volontaires.</p>
            <Input name="placesTotal" onChange={handleChange} value={values.placesTotal} type="number" min={0} max={999} />
          </FormGroup>
          <FormGroup>
            <label>
              <span>*</span>FORMAT DE MISSION
            </label>
            <Field component="select" name="format" value={values.format} onChange={handleChange}>
              <option key="CONTINUOUS" value="CONTINUOUS">
                {translate("CONTINUOUS")}
              </option>
              <option key="DISCONTINUOUS" value="DISCONTINUOUS">
                {translate("DISCONTINUOUS")}
              </option>
            </Field>
          </FormGroup>
          <Legend>Dates de la mission {values.format === "CONTINUOUS" ? `continue` : `perlée`}</Legend>
          <Row>
            <Col>
              <FormGroup>
                <label>DATE DE DÉBUT</label>
                <Input type="date" name="date_start" value={values.start_date} onChange={handleChange} placeholder="Date de fin" />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <label>DATE DE FIN</label>
                <Input type="date" name="date_end" value={values.start_date} onChange={handleChange} placeholder="Date de fin" />
              </FormGroup>
            </Col>
          </Row>
          <FormGroup>
            <label>FRÉQUENCE ESTIMÉE DE LA MISSION</label>
            <p style={{ color: "#a0aec1", fontSize: 12 }}>
              Par exemple, tous les mardis soirs, le samedi, tous les mercredis après-midi pendant un trimestre, possibilité de moduler les horaires en fonction de l'emploi du
              temps du volontaire...
            </p>
            <textarea rows={2} placeholder="Fréquence estimée de la mission" />
          </FormGroup>
          <FormGroup>
            <label>PÉRIODES POSSIBLES POUR RÉALISER LA MISSION</label>
            <input placeholder="Sélectionner les périodes" />
          </FormGroup>
          <Legend>Détail de la mission</Legend>
          <FormGroup>
            <label>
              <span>*</span>DESCRIPTIF DE LA MISSION
            </label>
            <Field
              // validate={(v) => !v.length}
              name="description"
              component="textarea"
              rows={2}
              value={values.description}
              onChange={handleChange}
              placeholder="Décrivez votre mission, en quelques mots"
            />
          </FormGroup>
          <FormGroup>
            <label>
              <span>*</span>ACTIONS CONCRÈTES CONFIÉES AU(X) VOLONTAIRE(S)
            </label>
            <Field
              // validate={(v) => !v.length}
              name="actions"
              component="textarea"
              rows={2}
              value={values.actions}
              onChange={handleChange}
              placeholder="Actions concrètes confiées au(x) volontaire(s)"
            />
          </FormGroup>
          <FormGroup>
            <label>
              <span>*</span>EN QUOI LA MISSION PROPOSÉE PERMETTRA-T-ELLE AU VOLONTAIRE D’AGIR EN FAVEUR DE L’INTÉRÊT GÉNÉRAL ?
            </label>
            <p style={{ color: "#a0aec1", fontSize: 12 }}>
              Les réponses à cette question ne seront pas publiées. Elles permettront aux services référents de valider les missions.
            </p>
            <Field
              // validate={(v) => !v.length}
              name="justifications"
              component="textarea"
              rows={2}
              value={values.justifications}
              onChange={handleChange}
              placeholder="Décrivez votre mission, en quelques mots"
            />
          </FormGroup>
          <FormGroup>
            <label>
              <span>*</span>Y A-T-IL DES CONTRAINTES SPÉCIFIQUES POUR CETTE MISSION ?
            </label>
            <p style={{ color: "#a0aec1", fontSize: 12 }}>
              Par exemple, nécessité d’une bonne condition physique, mission en soirée, cette mission intègre une période de formation…
            </p>
            <Field
              // validate={(v) => !v.length}
              name="contraintes"
              component="textarea"
              rows={2}
              value={values.contraintes}
              onChange={handleChange}
              placeholder="Décrivez votre mission, en quelques mots"
            />
          </FormGroup>
          <Legend>Lieu de la mission</Legend>
          <FormGroup>
            <label>
              <span>*</span>DÉPARTEMENT
            </label>
            <Field
              // validate={(v) => !v.length}
              name="departement"
              onChange={handleChange}
              value={values.departement}
              placeholder="Département"
            />
          </FormGroup>
          <Legend>Tuteur de la mission</Legend>
          <p style={{ color: "#a0aec1", fontSize: 12 }}>
            Sélectionner le tuteur qui va s'occuper de la mission. Vous pouvez également <Link to="/team/invite">ajouter un nouveau tuteur</Link> à votre équipe.
          </p>
          <FormGroup>
            <label>
              <span>*</span>TUTEUR
            </label>
            <Field
              // validate={(v) => !v.length}
              name="tuteur"
              value={values.tuteur}
              onChange={handleChange}
              placeholder="Sélectionner un tuteur"
            />
          </FormGroup>
          <ButtonLight type="button" onClick={handleSubmit}>
            Enregistrer
          </ButtonLight>
          <Button
            type="button"
            disabled={!isValid}
            onClick={() => {
              handleChange({ target: { value: "WAITING_VALIDATION", name: "status" } });
              handleSubmit();
            }}
          >
            Enregistrer et proposer la mission
          </Button>
        </Wrapper>
      )}
    </Formik>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  ${FormGroup} {
    max-width: 750px;
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
    > span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  select,
  textarea,
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 20px;
`;

const ButtonLight = styled.button`
  background-color: #fff;
  border: 1px solid #dcdfe6;
  outline: 0;
  align-self: flex-start;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  width: 120px;
  color: #646b7d;
  cursor: pointer;
  margin-right: 10px;
  :hover {
    color: rgb(49, 130, 206);
    border-color: rgb(193, 218, 240);
    background-color: rgb(234, 243, 250);
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
