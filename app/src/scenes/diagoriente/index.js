import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { HeroContainer, Hero } from "../../components/Content";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import api from "../../services/api";
import { translate, formatStringDate } from "../../utils";

export default () => {
  const [diagorienteUrl, setDiagorienteUrl] = useState();
  const [diagorienteCardData, setDiagorienteCardData] = useState();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get("/diagoriente/generateUrl");
      if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
      setDiagorienteUrl(data.url);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get("/diagoriente/getCard");
      if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
      setDiagorienteCardData(data);
    })();
  }, []);

  useEffect(() => {
    function skillsData(skills, type) {
      return skills
        .filter((e) => e.theme.type === type)
        .map((e) => ({
          title: e.theme.title,
          activities: e.activities.map((f) => f.title),
          startDate: e.startDate,
          endDate: e.endDate,
        }));
    }
    if (diagorienteCardData) {
      setSkills([
        {
          title: "Expériences personnelles",
          descriptionWhenEmpty: "Vous n'avez pas encore renseigné d'expériences personnelles",
          data: skillsData(diagorienteCardData.skills, "personal"),
        },
        {
          title: "Expériences professionnelles",
          descriptionWhenEmpty: "Vous n'avez pas encore renseigné d'expériences professionnelles",
          data: skillsData(diagorienteCardData.skills, "professional"),
        },
        { title: "Expériences sportives", descriptionWhenEmpty: "Vous n'avez pas encore renseigné d'expériences sportives", data: skillsData(diagorienteCardData.skills, "sport") },
        {
          title: "Expériences d'engagement",
          descriptionWhenEmpty: "Vous n'avez pas encore renseigné d'expériences d'engagement",
          data: skillsData(diagorienteCardData.skills, "engagement"),
        },
        { title: "Expériences SNU", descriptionWhenEmpty: "Vous n'avez pas encore renseigné d'expériences SNU", data: skillsData(diagorienteCardData.skills, "snu") },
      ]);
    }
  }, [diagorienteCardData]);

  return (
    <>
      <HeroContainer>
        <Hero>
          <div className="content">
            <img src={require("../../assets/logo-diagoriente-blue.png")} />
            <h1>Identifiez vos compétences et explorez vos intérêts</h1>
            <p>Complète tes expériences, qu'elles soient professionnelles ou personnelles, puis évalue tes compétences.</p>
            <VioletButton>
              <a href={diagorienteUrl} target="_blank">
                Accéder à Diagoriente
              </a>
            </VioletButton>
          </div>
          <div className="diagorente" />
        </Hero>
      </HeroContainer>
      <MiddleContainer>
        <h2>Ma carte de compétences</h2>
      </MiddleContainer>
      <CardContainer>
        <Row>
          {skills.map((skill, key) => {
            return (
              <Col md={6} xs={12} key={key}>
                <Card>
                  <div className="content">
                    <h2>{skill.title}</h2>
                    {skill.data?.length ? (
                      <div className="skills-data">
                        {skill.data.map((item, itemKey) => {
                          return (
                            <div className="skills-item" key={itemKey}>
                              <h3>{item.title}</h3>
                              {item.startDate || item.endDate ? (
                                <h4>
                                  {formatStringDate(item.startDate)} - {formatStringDate(item.endDate)}
                                </h4>
                              ) : null}
                              {item.activities?.length ? (
                                <ul>
                                  {item.activities.map((activity, activityKey) => (
                                    <li key={activityKey}>{activity}</li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ minHeight: "150px" }}>{skill.descriptionWhenEmpty}</p>
                    )}

                    <Separator />
                    <ContainerFooter>
                      <p>
                        <a target="_blank" href={diagorienteUrl}>
                          J'AJOUTE UNE EXPERIENCE
                        </a>
                      </p>
                    </ContainerFooter>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </CardContainer>
    </>
  );
};

const MiddleContainer = styled.div`
  font-size: 1rem;
  padding: 3rem;
  margin: auto;
  textarea {
    width: 100%;
    height: 130px;
  }
  h2 {
    margin-top: 2rem;
    font-size: 2rem;
    text-align: center;
    color: grey;
  }
`;

const Card = styled(Row)`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  margin: 1rem 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  text-align: center;
  justify-content: space-between;
  background-color: #fff;

  .content {
    flex: 1;
    @media (max-width: 768px) {
      width: 100%;
    }
    padding: 30px 0px 0px 0px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1,
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h1 {
    font-size: 3rem;
  }
  .skills-data {
    min-height: 150px;
    margin-bottom: 1rem;
    .skills-item {
      margin: 0 0.5rem 1rem;
      h3 {
        font-size: 1.25rem;
      }
      h4 {
        font-size: 1rem;
        font-weight: 500;
      }
      ul {
        color: #6b7280;
      }
    }
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    padding: 0px 50px 0px 30px;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    a {
      font-size: 1rem;
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
`;

const CardContainer = styled.div`
  display: flex;
  justify-self: center;
  margin: 0 1rem;
  flex-direction: column;
  padding: 0rem 0rem 1rem 0rem;
  @media (max-width: px) {
    padding: 1rem 0;
  }
`;

const ContainerFooter = styled.div`
  display: flex;
  align-self: flex-end;
  justify-content: center;
  padding: 0.7rem;
  div {
    cursor: pointer;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    border-radius: 0.2rem;
    padding: 5px 15px;
    margin-right: 15px;
    font-size: 12px;
    font-weight: 500;
  }
  p {
    font-weight: bold;
    color: #5145cd;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 500;
    a {
      font-size: 1rem;
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
`;

const Separator = styled.hr`
  /* margin: 0 2.5rem; */
  height: 1px;
  margin: 0;
  border-style: none;
  background-color: #e5e7eb;
`;

const VioletButton = styled.button`
  display: inline-block;
  background-color: #5145cd;
  padding: 10px 40px;
  color: #fff;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
  margin: 25px auto 10px;
  border-radius: 30px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  :hover {
    opacity: 0.9;
  }
  :disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
  a {
    color: #fff;
  }
`;
