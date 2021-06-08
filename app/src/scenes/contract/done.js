import React from "react";
import styled from "styled-components";

import { Box } from "../../components/box";

export default () => {
  return (
    <div>
      <div style={{ display: "flex" }}>
        <img style={{ margin: "auto", paddingTop: "2rem" }} src={require("../../assets/logo-snu.png")} height={96} />
      </div>
      <div style={{ display: "flex", margin: "2rem" }}>
        <Box style={{ margin: "auto", maxWidth: "600px" }}>
          <ContractContainer>
            <div style={{ textAlign: "center", marginTop: "-1rem" }}>
              <h2>Contrat d'engagement validé</h2>
              <p>Merci d'avoir pris le temps de valider le contrat d'engagement en mission d'intérêt général du volontaire.</p>
            </div>
          </ContractContainer>
        </Box>
      </div>
    </div>
  );
};

const ContractContainer = styled.div`
  font-size: 1rem;
  padding: 3rem;
  margin: auto;
  input,
  textarea {
    padding: 0.5rem;
    margin: 1rem 0.25rem 0 0.25rem;
    background-color: #f3f2ff;
    border: 1px solid #372f78;
    border-radius: 8px;
  }
  input::placeholder {
    color: #b3b2bf;
  }
  textarea {
    width: 100%;
    height: 130px;
  }
  input.md {
    width: 250px;
  }
  input.lg {
    width: 400px;
  }
  h2,
  h3,
  h4 {
    font-weight: bold;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }
  h2 {
    margin-top: 2rem;
    font-size: 1.5rem;
  }
`;
