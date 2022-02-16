import React, { useState, useEffect } from "react";


import CloseSvg from "../../assets/Close";
import styled from "styled-components";
import Chevron from "../../components/Chevron";
import { HeroContainer, Hero, Content } from "../../components/Content";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

export default function changeSejour() {
const [newSejour, setNewSejour] = useState();
const [motif, setMotif] = useState("");

const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

    return (
        <>
        <HeroContainer>
            <Hero>
                <Content style={{ width: "100%", padding: "3.2rem" }}>
                    <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
                    <p style={{ margin: 0 }}>Choix du nouveau séjour :</p>
                        <CohortDropDown cohort={newSejour} color="#ffffff" onClick={(value) => { } } width="375px" />
                    <p style={{ margin: 0 }}>Précisez le motif de changement de séjour :</p>

                    <ActionBox color="#ffffff" width="375px">
                        <UncontrolledDropdown setActiveFromChild>
                        <DropdownToggle tag="button">
                            {motif || <p></p>}
                            <Chevron color="#9a9a9a" />
                        </DropdownToggle>
                        <DropdownMenu>
                            {motifs
                            .filter((e) => e !== motif)
                            .map((status) => {
                                return (
                                <DropdownItem key={status} className="dropdown-item" onClick={() => setMotif(status)}>
                                    {status}
                                </DropdownItem>
                                );
                            })}
                        </DropdownMenu>
                        </UncontrolledDropdown>
                    </ActionBox>
                    </div>
                    <p style={{ margin: 0, marginTop: "16px" }}>
                    Pourquoi je ne vois pas tous les séjours ?{" "}
                    <a href="https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1" style={{ color: "#5145cc" }}>
                    En savoir plus sur les séjours où je suis éligible.                  </a>
                    </p>
                </Content>
            </Hero>
        </HeroContainer>
      </>
    )
};


const CohortDropDown = ({ cohort, onClick, color, width }) => {
    const options = ["Juillet 2022", "Juin 2022", "Février 2022"];
  
    return (
      <ActionBox color={color} width={width}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            Cohorte {cohort}
            <Chevron color="#9a9a9a" />
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== cohort)
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => onClick(status)}>
                    Cohorte {status}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </UncontrolledDropdown>
      </ActionBox>
    );
  };

  const ActionBox = styled.div`
  margin-left: 10px;
  .dropdown-menu {
    width: ${({ width }) => width};
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    background-color: ${({ color }) => color};
    border: 1px solid #cecece;
    color: #9a9a9a;
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: ${({ width }) => width};
    min-height: 34px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;

