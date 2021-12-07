import React from "react";
import { Col, Row } from "reactstrap";
import { MISSION_DOMAINS, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, PERIOD, TRANSPORT, translate } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle, BoxTitleCircular } from "../../../components/box";
import Item from "../components/Item";
import MultiSelect from "../../../components/Multiselect";
import Select from "../components/Select";
import RankingPeriod from "./components/rankingPeriod";

export default function Preference({ values, handleChange }) {
  return (
    <>
      <Col md={6} style={{ marginBottom: "20px" }}>
        <Box>
          <BoxHeadTitle>Préférences de missions 1/2</BoxHeadTitle>
          <BoxContent direction="column">
            <MultiSelectWithTitle
              title="Domaines"
              value={values.domains}
              onChange={handleChange}
              name="domains"
              options={Object.values(MISSION_DOMAINS)}
              placeholder="Sélectionnez trois domaines"
            />
            <Select
              name="professionnalProject"
              values={values}
              handleChange={handleChange}
              title="Projet professionnel"
              options={[
                { value: PROFESSIONNAL_PROJECT.UNIFORM, label: translate(PROFESSIONNAL_PROJECT.UNIFORM) },
                { value: PROFESSIONNAL_PROJECT.OTHER, label: translate(PROFESSIONNAL_PROJECT.OTHER) },
                { value: PROFESSIONNAL_PROJECT.UNKNOWN, label: translate(PROFESSIONNAL_PROJECT.UNKNOWN) },
              ]}
            />
            {values.professionnalProject && values.professionnalProject !== PROFESSIONNAL_PROJECT.UNKNOWN ? (
              <>
                {values.professionnalProject === PROFESSIONNAL_PROJECT.UNIFORM ? (
                  <Select
                    name="professionnalProjectPrecision"
                    values={values}
                    handleChange={handleChange}
                    title="Précisez"
                    options={[
                      { value: PROFESSIONNAL_PROJECT_PRECISION.FIREFIGHTER, label: translate(PROFESSIONNAL_PROJECT_PRECISION.FIREFIGHTER) },
                      { value: PROFESSIONNAL_PROJECT_PRECISION.ARMY, label: translate(PROFESSIONNAL_PROJECT_PRECISION.ARMY) },
                      { value: PROFESSIONNAL_PROJECT_PRECISION.POLICE, label: translate(PROFESSIONNAL_PROJECT_PRECISION.POLICE) },
                    ]}
                  />
                ) : (
                  <Item title="Précisez" values={values} name="professionnalProjectPrecision" handleChange={handleChange} />
                )}
              </>
            ) : null}
            <Select
              name="period"
              values={values}
              handleChange={handleChange}
              title="Période"
              options={[
                { value: PERIOD.DURING_HOLIDAYS, label: translate(PERIOD.DURING_HOLIDAYS) },
                { value: PERIOD.DURING_SCHOOL, label: translate(PERIOD.DURING_SCHOOL) },
              ]}
            />
            {values.period ? <RankingPeriod handleChange={handleChange} title={translate(values.period)} period={values.period} values={values} name="periodRanking" /> : null}
          </BoxContent>
        </Box>
      </Col>
      <Col md={6} style={{ marginBottom: "20px" }}>
        <Box>
          <BoxHeadTitle>Préférences de missions 2/2</BoxHeadTitle>
          <BoxContent direction="column">
            <BoxTitleCircular>Mission à proximité de</BoxTitleCircular>
            <Select
              name="mobilityNearSchool"
              values={values}
              handleChange={handleChange}
              title="Établissement"
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
            <Select
              name="mobilityNearHome"
              values={values}
              handleChange={handleChange}
              title="Domicile"
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
            <Select
              name="mobilityNearRelative"
              values={values}
              handleChange={handleChange}
              title="Proche"
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
            {values.mobilityNearRelative && values.mobilityNearRelative === "true" && (
              <>
                <BoxTitleCircular>Coordonnées du proche</BoxTitleCircular>
                <Item title="Nom" values={values} name="mobilityNearRelativeName" handleChange={handleChange} />
                <Item title="Adresse" values={values} name="mobilityNearRelativeAddress" handleChange={handleChange} />
                <Item title="Code postal" values={values} name="mobilityNearRelativeZip" handleChange={handleChange} />
                <Item title="Ville" values={values} name="mobilityNearRelativeCity" handleChange={handleChange} />
              </>
            )}
            <hr />
            <MultiSelectWithTitle
              title="Moyen de transport"
              value={values.mobilityTransport}
              onChange={handleChange}
              name="mobilityTransport"
              options={Object.values(TRANSPORT)}
              placeholder="Moyen de transport"
            />
            {values.mobilityTransport && values.mobilityTransport.includes(TRANSPORT.OTHER) && (
              <Item title="Autre (Précisez)" values={values} name="mobilityTransportOther" handleChange={handleChange} />
            )}
            <Select
              name="missionFormat"
              values={values}
              handleChange={handleChange}
              title="Format de mission"
              options={[
                { value: "CONTINUOUS", label: translate("CONTINUOUS") },
                { value: "DISCONTINUOUS", label: translate("DISCONTINUOUS") },
              ]}
            />
            <Select
              name="engaged"
              values={values}
              handleChange={handleChange}
              title="Bénévole en parallèle"
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
            {values.engaged && values.engaged === "true" && <Item title="Description de l'activité" values={values} name="engagedDescription" handleChange={handleChange} />}
            <Item title="Endroit où souhaite effectuer la mission" values={values} name="desiredLocation" handleChange={handleChange} />
          </BoxContent>
        </Box>
      </Col>
    </>
  );
}

const MultiSelectWithTitle = ({ title, value, onChange, name, options, placeholder }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <MultiSelect value={value} onChange={onChange} name={name} options={options} placeholder={placeholder} />
      </Col>
    </Row>
  );
};
