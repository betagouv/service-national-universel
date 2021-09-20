import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { NavLink } from "react-router-dom";

import api from "../../../services/api";
import { translate, formatStringLongDate } from "../../../utils";
import Loader from "../../../components/Loader";
import Badge from "../../../components/Badge";
import DomainThumb from "../../../components/DomainThumb";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default (props) => {
  const [ticket, setTicket] = useState();
  const [message, setMessage] = useState();

  const getTicket = async () => {
    const id = props.match?.params?.id;
    if (!id) return setTicket(null);
    const { data } = await api.get(`/support-center/ticket/${id}`);
    return setTicket(data);
  };
  useEffect(() => {
    getTicket();
  }, []);

  const send = async () => {
    if (!message) return;
    const id = props.match?.params?.id;
    const { data } = await api.put(`/support-center/ticket/${id}`, { message });
    setMessage("");
    getTicket();
  };

  if (ticket === undefined) return <Loader />;

  return (
    <Container>
      <BackButton to={`/support`}>{"<"} Retour</BackButton>
      <Heading>
        <h1>Demande #{props.match?.params?.id}</h1>
      </Heading>
      <Row style={{ marginBottom: "1rem" }}>
        <Col md={4}>
          <Box>
            <Details title="Sujet" content={ticket?.title} />
            <hr />
            <Details title="Création" content={formatStringLongDate(ticket?.created_at)} />
            <Details title="Dernière activité" content={formatStringLongDate(ticket?.updated_at)} />
            <Details title="Agent" />
          </Box>
        </Col>
        <Col md={8}>
          <div>
            <Box style={{ marginBottom: "1rem" }}>
              {ticket?.articles?.map((article, i) => (
                <Message key={i} from={article.from} date={article.created_at} content={article.body} />
              ))}
            </Box>
            <Box>
              <InputContainer>
                <input className="form-control" onChange={(e) => setMessage(e.target.value)} value={message} />
                <LoadingButton onClick={send} disabled={!message}>
                  Envoyer
                </LoadingButton>
              </InputContainer>
            </Box>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

const Message = ({ from, date, content }) => {
  return content && content.length ? (
    <MessageContainer>
      <MessageHeader>
        <MessageFrom>{from}</MessageFrom>
        <MessageDate>{formatStringLongDate(date)}</MessageDate>
      </MessageHeader>
      <MessageContent dangerouslySetInnerHTML={{ __html: content }}></MessageContent>
    </MessageContainer>
  ) : (
    <div />
  );
};

const Details = ({ title, content }) => {
  return content && content.length ? (
    <DetailContainer>
      <DetailHeader>{title}</DetailHeader>
      <DetailContent>{content}</DetailContent>
    </DetailContainer>
  ) : (
    <div />
  );
};

const BackButton = styled(NavLink)`
  color: #666;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.5rem;
`;
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`;
const DetailHeader = styled.div`
  color: #444;
  font-size: 0.8rem;
  font-weight: 600;
`;
const DetailContent = styled.div`
  font-weight: 400;
  color: #666;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
`;
const MessageHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 0.2rem;
`;
const MessageFrom = styled.div`
  color: #444;
  font-size: 0.8rem;
  font-weight: 600;
`;
const MessageDate = styled.div`
  color: #666;
  font-weight: 400;
  font-size: 0.8rem;
`;
const MessageContent = styled.div`
  font-weight: 400;
  color: #666;
`;
const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
  padding: 1rem;
`;

const Heading = styled(Container)`
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
  h1 {
    color: #161e2e;
    font-size: 2rem;
    font-weight: 700;
    padding-right: 3rem;
    @media (max-width: 768px) {
      padding-right: 1rem;
      font-size: 1.1rem;
    }
  }
  p {
    &.title {
      color: #42389d;
      font-size: 1rem;
      @media (max-width: 768px) {
        font-size: 0.7rem;
      }
      font-weight: 700;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    &.button-subtitle {
      margin-top: 1rem;
      text-align: center;
      color: #6b7280;
      font-size: 0.75rem;
    }
  }
`;
