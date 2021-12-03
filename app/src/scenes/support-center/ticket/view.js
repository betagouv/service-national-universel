import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { formatStringLongDate, colors, ticketStateNameById, translateState } from "../../../utils";
import Loader from "../../../components/Loader";
import LoadingButton from "../../../components/buttons/LoadingButton";
import SendIcon from "../../../components/SendIcon";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";

const updateHeightElement = (e) => {
  e.style.height = "inherit";
  e.style.height = `${e.scrollHeight}px`;
};

export default function TicketView(props) {
  const [ticket, setTicket] = useState();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState();
  const young = useSelector((state) => state.Auth.young);
  const inputRef = React.useRef();

  const getTicket = async () => {
    try {
      const id = props.match?.params?.id;
      if (!id) return setTicket(null);
      const { data, ok } = await api.get(`/support-center/ticket/${id}`);
      if (data.error || !ok) return setTicket(null);
      return setTicket(data);
    } catch (e) {
      setTicket(null);
    }
  };
  useEffect(() => {
    getTicket();
    const ping = setInterval(getTicket, 5000);
    return () => {
      clearInterval(ping);
    };
  }, []);

  const send = async () => {
    setSending(true);
    if (!message) return setSending(false);
    const id = props.match?.params?.id;
    await api.put(`/support-center/ticket/${id}`, { message, ticket });
    setMessage("");
    updateHeightElement(inputRef?.current);
    getTicket();
    setSending(false);
  };

  if (ticket === undefined) return <Loader />;

  const displayState = (state) => {
    if (state === "open")
      return (
        <StateContainer style={{ display: "flex" }}>
          <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
    if (state === "closed")
      return (
        <StateContainer>
          <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
    if (state === "new")
      return (
        <StateContainer>
          <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
  };

  return (
    <Container>
      <BackButtonContainer>
        <BackButton to={`/besoin-d-aide`}>{"<"} Retour à mes demandes</BackButton>
      </BackButtonContainer>
      <div style={{ padding: 0, display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
        <Heading>
          <div>
            <h1>
              Demande #{ticket?.number} - {ticket?.title}
            </h1>
            <Details title="Crée le" content={ticket?.created_at && formatStringLongDate(ticket?.created_at)} />
          </div>
          {displayState(ticketStateNameById(ticket?.state_id))}
        </Heading>
        <Messages>
          {ticket?.articles
            ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            ?.filter((article) => !article.internal)
            ?.map((article, i) => (
              <Message key={i} fromMe={young.email === article.created_by} from={article.from} date={formatStringLongDate(article.created_at)} content={article.body} />
            ))}
        </Messages>
        <InputContainer>
          <textarea
            ref={inputRef}
            row={2}
            placeholder="Mon message..."
            className="form-control"
            onChange={(e) => {
              setMessage(e.target.value);
              updateHeightElement(e.target);
            }}
            value={message}
          />
          <ButtonContainer>
            <LoadingButton onClick={send} disabled={!message || sending} color="white">
              <SendIcon color={!message ? "grey" : null} />
            </LoadingButton>
          </ButtonContainer>
        </InputContainer>
      </div>
    </Container>
  );
}

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

const Messages = styled.div`
  display: flex;
  flex-direction: column-reverse;
  overflow-y: scroll;
  flex: 1;
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-left: 1px solid #e4e4e7;
`;

const StateContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background-color: #fff;
  textarea {
    resize: none;
    overflow: none;
    min-height: 50px;
    max-height: 300px;
    border: none;
  }
`;
const ButtonContainer = styled.div`
  flex-basis: 100px;
  align-self: center;
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

const Heading = styled(Container)`
  display: flex;
  flex: 0;
  justify-content: space-between;
  align-items: space-between;
  background-color: #fff;
  padding: 1rem;
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

const BackButtonContainer = styled.div`
  padding: 0.5rem 0;
`;

const BackButton = styled(NavLink)`
  color: #666;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;
