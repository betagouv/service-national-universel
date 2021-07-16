import React from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import DndFileInput from "../../../components/dndFileInput";
import api from "../../../services/api";
import ErrorMessage from "../../../components/ErrorMessage";

export default ({
  values,
  errors,
  name,
  handleChange,
  upTitle = "document requis",
  title = "Carte d'embarquement militaire",
  subTitle = "Cette pièce est importante et tu le sais",
  errorMessage = "Ce document est requis",
}) => (
  <Card>
    <Content>
      <UpTitle>{upTitle}</UpTitle>
      <Title>{title}</Title>
      <SubTitle>{subTitle}</SubTitle>
      <DndFileInput
        errorMessage={errorMessage}
        value={values[name]}
        name={name}
        onChange={async (e) => {
          const res = await api.uploadFile(`/young/file/${name}`, e.target.files);

          if (res.code === "FILE_CORRUPTED") {
            return toastr.error(
              "Le fichier semble corrompu",
              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
              { timeOut: 0 }
            );
          }
          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
          // We update it instant ( because the bucket is updated instant )
          toastr.success("Fichier téléversé");
          handleChange({ target: { value: res.data, name } });
        }}
      />
      <ErrorMessage errors={errors} name={name} />
    </Content>
  </Card>
);

const Card = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  margin: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  height: 100%;
`;

const Content = styled.div`
  width: 100%;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    text-align: center;
  }
  position: relative;
  background-color: #fff;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
`;

const UpTitle = styled.div`
  text-align: center;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 500;
`;
const Title = styled.div`
  text-align: center;
  font-size: 1.35rem;
  font-weight: 600;
`;
const SubTitle = styled.div`
  text-align: center;
  font-size: 1rem;
  font-weight: 400;
  color: grey;
`;
