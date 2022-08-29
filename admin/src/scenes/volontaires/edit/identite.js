import React from "react";
import { Col } from "reactstrap";

import DndFileInput from "../../../components/dndFileInputV2";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import Item from "../components/Item";
import Documents from "../components/Documents";
import Select from "../components/Select";

export default function Identite({ values, handleChange, required = {}, errors, touched }) {
  return (
    <Col md={6} style={{ marginBottom: "20px" }}>
      <Box>
        <BoxHeadTitle>Identité</BoxHeadTitle>
        <BoxContent direction="column">
          <Item title="Nom" values={values} name={"lastName"} handleChange={handleChange} required={required.lastName} errors={errors} touched={touched} />
          <Item title="Prénom" values={values} name="firstName" handleChange={handleChange} required={required.firstName} errors={errors} touched={touched} />
          <Item
            title="Date de naissance"
            type="date"
            values={values}
            name="birthdateAt"
            handleChange={handleChange}
            required={required.birthdateAt}
            errors={errors}
            touched={touched}
          />
          <Select
            title="Sexe"
            values={values}
            name="gender"
            handleChange={handleChange}
            options={[
              { value: "male", label: "Homme" },
              { value: "female", label: "Femme" },
            ]}
            required={required.gender}
            errors={errors}
            touched={touched}
          />
          <Item title="E-mail" values={values} name="email" handleChange={handleChange} required={required.email} errors={errors} touched={touched} />
          <Item title="Tél." values={values} name="phone" handleChange={handleChange} required={required.phone} errors={errors} touched={touched} />
          <Item
            title="Pays de naissance"
            values={values || "France"}
            name="birthCountry"
            handleChange={handleChange}
            required={required.birthCountry}
            errors={errors}
            touched={touched}
          />
          <Item title="Ville de naissance" values={values} name="birthCity" handleChange={handleChange} required={required.birthCity} errors={errors} touched={touched} />
          <Item
            title="Code postal de la ville de naissance"
            values={values}
            name="birthCityZip"
            handleChange={handleChange}
            required={required.birthCityZip}
            errors={errors}
            touched={touched}
          />
          <Documents>
            <h4>Pièces d&apos;identité</h4>
            <DndFileInput
              placeholder="une pièce d'identité"
              errorMessage="Vous devez téléverser une pièce d'identité"
              value={values.files.cniFiles}
              path={`/young/${values._id}/documents/cniFiles`}
              name="cniFiles"
            />
          </Documents>
        </BoxContent>
      </Box>
    </Col>
  );
}
