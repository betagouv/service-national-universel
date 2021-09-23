import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { formatStringLongDate, colors } from "../../../utils";
import Loader from "../../../components/Loader";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default ({ ticketId }) => {
  const [ticket, setTicket] = useState();
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState();
  const user = useSelector((state) => state.Auth.user);

  const getTicket = async () => {
    try {
      // setTicket(null);
      if (!ticketId) return; //setTicket(null);
      const { data, ok } = await api.get(`/support-center/ticket/${ticketId}`);
      if (data.error || !ok) return setTicket(null);
      return setTicket(data);
    } catch (e) {
      setTicket(null);
    }
  };

  useEffect(() => {
    //  setLoading(true)
    getTicket();
    //  setLoading(false)
    const ping = setInterval(getTicket, 5000);
    return () => {
      clearInterval(ping);
    };
  }, [ticketId]);

  const send = async () => {
    if (!message) return;
    const { data } = await api.put(`/support-center/ticket/${ticketId}`, { message });
    setMessage("");
    getTicket();
  };

  if (ticket === undefined) return <div>Selectionnez un ticket</div>;

  if (ticket === null) return <Loader />;

  return (
    <Container style={{ padding: 0, backgroundColor: "#F1F5F9", border: "1px solid #E4E4E7" }}>
      <Heading>
        <h1>
          Demande #{ticket?.id} - {ticket?.title}
        </h1>
        <Details title="Crée le" content={ticket?.created_at && formatStringLongDate(ticket?.created_at)} />
      </Heading>
      <div>
        <Box>
          {ticket?.articles
            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            ?.map((article, i) => (
              <Message key={i} fromMe={user.email === article.created_by} from={article.from} date={formatStringLongDate(article.created_at)} content={article.body} />
            ))}
        </Box>
        <InputContainer>
          <textarea row={2} placeholder="Mon message..." className="form-control" onChange={(e) => setMessage(e.target.value)} value={message} />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <LoadingButton onClick={send} disabled={!message}>
              Envoyer
            </LoadingButton>
          </div>
        </InputContainer>
      </div>
    </Container>
  );
};

const Message = ({ from, date, content, fromMe }) => {
  if (!content || !content.length) return null;
  return fromMe ? (
    <MessageContainer>
      <MessageBubble align={"right"} backgroundColor={colors.darkPurple}>
        <MessageContent color="white" dangerouslySetInnerHTML={{ __html: content }}></MessageContent>
        <MessageDate color="#ccc">{date}</MessageDate>
      </MessageBubble>
    </MessageContainer>
  ) : (
    <MessageContainer>
      <MessageFrom>{from}</MessageFrom>
      <MessageBubble align={"left"} backgroundColor={colors.lightGrey} color="white">
        <MessageContent dangerouslySetInnerHTML={{ __html: content }}></MessageContent>
        <MessageDate>{date}</MessageDate>
      </MessageBubble>
    </MessageContainer>
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

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 0.5rem;
`;
const DetailContainer = styled.div`
  display: flex;
  align-items: center;
`;
const DetailHeader = styled.div`
  color: #444;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 1rem;
`;
const DetailContent = styled.div`
  font-weight: 400;
  color: #666;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem;
`;
const MessageBubble = styled.div`
  max-width: 80%;
  min-width: 20%;
  padding: 0.5rem 1.5rem;
  border-radius: 1rem;
  background-color: ${({ backgroundColor }) => backgroundColor};
  margin-left: ${({ align }) => (align === "right" ? "auto" : 0)};
  margin-right: ${({ align }) => (align === "left" ? "auto" : 0)};
`;
const MessageFrom = styled.div`
  color: #444;
  font-size: 0.8rem;
  font-weight: 300;
  margin-left: 0.5rem;
`;
const MessageDate = styled.div`
  color: ${({ color }) => color};
  font-weight: 400;
  font-size: 0.65rem;
  text-align: right;
  font-style: italic;
`;
const MessageContent = styled.div`
  font-weight: 400;
  color: ${({ color }) => color};
`;
const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const Heading = styled(Container)`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  align-items: space-between;
  background-color: #fff;
  padding: 0.5rem;
  border: 1px solid #e4e4e7;
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
  h1 {
    color: #161e2e;
    font-size: 1rem;
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
