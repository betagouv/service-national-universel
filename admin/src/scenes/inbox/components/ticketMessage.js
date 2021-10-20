import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { formatStringAndDateLong, colors, ticketStateNameById } from "../../../utils";
import Loader from "../../../components/Loader";
import LoadingButton from "../../../components/buttons/LoadingButton";
import SendIcon from "../../../components/SendIcon";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";

const updateHeightElement = (e) => {
  e.target.style.height = "inherit";
  e.target.style.height = `${e.target.scrollHeight}px`;
};

export default ({ ticket: propTicket }) => {
  const [ticket, setTicket] = useState(propTicket);
  const [message, setMessage] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [sending, setSending] = useState(false);

  const updateTicket = async (id) => {
    try {
      if (!id) {
        return setTicket(undefined);
      }
      const { data, ok } = await api.get(`/support-center/ticket/${id}`);
      if (data.error || !ok) return setTicket(propTicket);
      return setTicket(data);
    } catch (e) {
      setTicket(undefined);
    }
  };

  useEffect(() => {
    updateTicket(propTicket?.id);
    const ping = setInterval(() => updateTicket(propTicket?.id), 5000);
    return () => {
      clearInterval(ping);
    };
  }, [propTicket]);

  const send = async () => {
    setSending(true);
    if (!message) return setSending(false);

    // then send the message
    // todo : we may be able to reset the status in only one call
    // but im not sure the POST for a message can take state in its body
    const responseMessage = await api.put(`/support-center/ticket/${ticket?.id}`, { message, ticket });

    // reset ticket and input message
    setMessage("");
    updateTicket(ticket?.id);
    setSending(false);
  };

  if (ticket === null) return <Loader />;

  const displayState = (state) => {
    if (state === "ouvert")
      return (
        <StateContainer style={{ display: "flex" }}>
          <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
          ouvert
        </StateContainer>
      );
    if (state === "fermé")
      return (
        <StateContainer>
          <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
          archivé
        </StateContainer>
      );
    if (state === "nouveau")
      return (
        <StateContainer>
          <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
          nouveau
        </StateContainer>
      );
  };

  return (
    <Container style={{ padding: 0, backgroundColor: "#F1F5F9", border: "1px solid #E4E4E7", display: "flex", flexDirection: "column" }}>
      {ticket === undefined ? (
        <div>Selectionnez un ticket</div>
      ) : (
        <>
          <Heading>
            <div>
              <h1>
                Demande #{ticket?.number} - {ticket?.title}
              </h1>
              <Details title="Crée le" content={ticket?.created_at && formatStringAndDateLong(ticket?.created_at)} />
            </div>
            {displayState(ticketStateNameById(ticket?.state_id))}
          </Heading>
          <Messages>
            {ticket?.articles
              ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              ?.map((article, i) => (
                <Message
                  internal={article.internal}
                  key={i}
                  fromMe={user.email === article.created_by}
                  from={article.from}
                  date={formatStringAndDateLong(article.created_at)}
                  content={article.body}
                />
              ))}
          </Messages>
          <InputContainer>
            <textarea
              row={2}
              placeholder="Mon message..."
              className="form-control"
              onChange={(e) => {
                setMessage(e.target.value);
                updateHeightElement(e);
              }}
              value={message}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "white" }}>
              <LoadingButton color="transparent" style={{ height: "100%" }} onClick={send} disabled={!message || sending}>
                <SendIcon />
              </LoadingButton>
            </div>
          </InputContainer>
        </>
      )}
    </Container>
  );
};

const Message = ({ from, date, content, fromMe, internal }) => {
  if (!content || !content.length) return null;
  return fromMe ? (
    <MessageContainer>
      <MessageBubble internal={internal} align={"right"} backgroundColor={internal ? "gold" : colors.darkPurple}>
        {internal ? <MessageNote>note interne</MessageNote> : null}
        <MessageContent color="white" dangerouslySetInnerHTML={{ __html: content }}></MessageContent>
        <MessageDate color="#ccc">{date}</MessageDate>
      </MessageBubble>
    </MessageContainer>
  ) : (
    <MessageContainer>
      <MessageFrom>{from}</MessageFrom>
      <MessageBubble internal={internal} align={"left"} backgroundColor={internal ? "gold" : colors.lightGrey} color="white">
        {internal ? <MessageNote>note interne</MessageNote> : null}
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

const Messages = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow-y: scroll;
  flex: 1;
  padding: 0.5rem;
`;

const StateContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100px;
  ${"" /* flex: 0; */}
  textarea {
    resize: none;
    overflow: none;
    min-height: 50px;
    max-height: 300px;
    border: none;
  }
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
  max-width: 60%;
  min-width: 20%;
  padding: 0.5rem 1.5rem;
  border-radius: ${({ internal }) => (internal ? "0.2rem" : "1rem")};
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
const MessageNote = styled.div`
  color: #a37502;
  font-weight: 400;
  font-size: 0.65rem;
  text-align: right;
  font-style: italic;
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
  ${"" /* height: 100%; */}
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const Heading = styled(Container)`
  display: flex;
  flex: 0;
  justify-content: space-between;
  align-items: space-between;
  background-color: #fff;
  padding: 0.5rem;
  border-bottom: 1px solid #e4e4e7;
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
