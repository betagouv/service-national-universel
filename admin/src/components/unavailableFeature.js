import React from "react";
import styled from "styled-components";
import gear from "../assets/tools.png";

export default function UnavailableFeature({ text, functionality, link, textLink }) {
  return (
    <TableWrapper>
      <img src={gear} />
      <article>
        <h2>{functionality}</h2>
        <h3>Cette fonctionnalité est momentanément indisponible.</h3>
        <section>
          <p>
            {text} <a href={link}>{textLink}</a>
          </p>
        </section>
      </article>
    </TableWrapper>
  );
}

// Table
const TableWrapper = styled.div`
  background-color: #fff;
  padding: 3rem;
  border: 1px solid #e2e2ea;
  border-radius: 10px;
  border-spacing: 0 2px;
  display: flex;
  align-items: center;
  img {
    width: 5rem;
    margin-right: 2rem;
  }
  article {
    margin: 1rem;
  }
  section {
    font-size: 1.2rem;
    display: flex;
    max-width: 900px;
    a {
      color: #5145cd;
      margin-left: 0.2rem;
    }
  }
`;
