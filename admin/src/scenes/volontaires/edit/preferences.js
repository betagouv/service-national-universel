import React from "react";
import { Col } from "reactstrap";
import { useSelector } from "react-redux";

import { MISSION_DOMAINS, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION, PERIOD, translate } from "../../../utils";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import MultiSelect from "../../../components/Multiselect";
import Select from "../components/Select";
import { Title } from "../../../components/list";

export default ({ values, handleChange, required = {}, errors, touched }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Préférences de missions</BoxHeadTitle>
        <BoxContent direction="column">
          <MultiSelect value={values.domains} onChange={handleChange} name="domains" options={Object.values(MISSION_DOMAINS)} placeholder="Sélectionnez trois domaines" />
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
          <p>Mission à proximité de</p>
          <Select
            name="mobilityNearSchool"
            values={values}
            handleChange={handleChange}
            title="Ecole"
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
          <Item title="Nom" values={values} name="schoolName" handleChange={handleChange} />
        </BoxContent>
      </Box>
    </Col>
  );
};
