import React from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import DndFileInput from "../../../components/dndFileInput";
import Box from "../components/Box";
import Item from "../components/Item";
import BoxContent from "../components/BoxContent";
import BoxTitle from "../components/BoxTitle";
import Documents from "../components/Documents";
import Select from "../components/Select";

export default ({ values, handleChange, handleSubmit, required = {}, errors, touched }) => (
  <Col md={6} style={{ marginBottom: "20px" }}>
    <Box>
      <BoxTitle>Identité</BoxTitle>
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
        <Documents>
          <h4>Pièces d'identité</h4>
          <DndFileInput
            placeholder="une pièce d'identité"
            errorMessage="Vous devez téléverser une pièce d'identité"
            value={values.cniFiles}
            source={(e) => api.get(`/referent/youngFile/${values._id}/cniFiles/${e}`)}
            name="cniFiles"
            onChange={async (e) => {
              const res = await api.uploadFile("/referent/file/cniFiles", e.target.files, { youngId: values._id });
              if (res.code === "FILE_CORRUPTED") {
                return toastr.error(
                  "Le fichier semble corrompu",
                  "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                  { timeOut: 0 }
                );
              }
              if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
              // We update and save it instant.
              handleChange({ target: { value: res.data, name: "cniFiles" } });
              handleSubmit();
            }}
          />
        </Documents>
      </BoxContent>
    </Box>
  </Col>
);
