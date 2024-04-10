import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import { formatStringLongDate, colors, ticketStateNameById, translateState, translate } from "../../../utils";
import Loader from "../../../components/Loader";
import LoadingButton from "../../../components/buttons/LoadingButton";
import SendIcon from "../../../components/SendIcon";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";
import { capture } from "../../../sentry";
import { htmlCleaner } from "snu-lib";

const updateHeightElement = (e) => {
  e.style.height = "inherit";
  e.style.height = `${e.scrollHeight}px`;
};

export default function TicketMessage({ ticket: propTicket }) {
  const [ticket, setTicket] = useState(propTicket);
  const [message, setMessage] = useState();
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const [sending, setSending] = useState(false);
  const inputRef = React.useRef();

  const getTicket = async (id) => {
    try {
      if (!id) return setTicket(undefined);
      const { data, ok } = await api.get(`/SNUpport/ticket/${id}?`);
      if (!ok) return;
      setTicket(data.ticket);
      const SNUpportMessages = data?.messages
        .map((message) => {
          return {
            id: message._id,
            fromMe: user.lastName === message.authorLastName && user.firstName === message.authorFirstName,
            from: `${message.authorFirstName} ${message.authorLastName}`,
            date: formatStringLongDate(message.createdAt),
            content: htmlCleaner(message.text),
            createdAt: message.createdAt,
          };
        })
        .filter((message) => message !== undefined);
      setMessages(SNUpportMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setTicket(undefined);
    }
  };

  useEffect(() => {
    getTicket(propTicket?._id);
  }, [propTicket]);

  const send = async () => {
    setSending(true);
    const id = ticket?._id;
    if (!message) return setSending(false);
    const { ok, code } = await api.post(`/SNUpport/ticket/${id}/message`, { message });
    if (!ok) {
      capture(new Error(code));
      toastr.error("Oups, une erreur est survenue", translate(code));
    }
    setMessage("");
    updateHeightElement(inputRef?.current);
    getTicket(id);
    setSending(false);
  };

  if (ticket === null) return <Loader />;

  const displayState = (state) => {
    if (state === "OPEN")
      return (
        <StateContainer style={{ display: "flex" }}>
          <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
    if (state === "CLOSED")
      return (
        <StateContainer>
          <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
    if (state === "NEW")
      return (
        <StateContainer>
          <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
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
                Demande #{ticket?.number} - {ticket?.subject}
              </h1>
              <Details title="Crée le" content={ticket?.createdAt && formatStringLongDate(ticket?.createdAt)} />
            </div>
            {displayState(ticket?.status)}
          </Heading>
          <Messages>
            {messages?.map((message) => (
              <Message key={message?.id} fromMe={message?.fromMe} from={message?.from} date={message?.date} content={message?.content} />
            ))}
          </Messages>
          <InputContainer>
            <textarea
              ref={inputRef}
              rows={2}
              placeholder="Mon message..."
              className="form-control"
              onChange={(e) => {
                setMessage(e.target.value);
                updateHeightElement(e.target);
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
}

const Message = ({ from, date, content, fromMe, internal }) => {
  if (!content || !content.length) return null;
  const text = content.replaceAll(/[\n\r]/g, "<br>");
  return fromMe ? (
    <MessageContainer>
      <MessageBubble internal={internal} align={"right"} backgroundColor={internal ? "gold" : colors.darkPurple}>
        {internal ? <MessageNote>note interne</MessageNote> : null}
        <MessageContent color="white" dangerouslySetInnerHTML={{ __html: text }}></MessageContent>
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
  flex: 0;
  textarea {
    resize: none;
    overflow: none;
    min-height: 100px;
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
