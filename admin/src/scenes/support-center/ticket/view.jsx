import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Container } from "reactstrap";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { formatStringLongDate, colors, ticketStateNameById, translateState, translate } from "../../../utils";
import Loader from "../../../components/Loader";
import LoadingButton from "../../../components/buttons/LoadingButton";
import SendIcon from "../../../components/SendIcon";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";
import FileUpload, { useFileUpload } from "../../../components/FileUpload";
import { capture } from "../../../sentry";
import FileSaver from "file-saver";
import { formatMessageForReadingInnerHTML, htmlCleaner } from "snu-lib";

const updateHeightElement = (e) => {
  e.style.height = "inherit";
  e.style.height = `${e.scrollHeight}px`;
};

const download = async (file) => {
  try {
    const s3Id = file.path.split("/")[1];
    const { ok, data } = await api.get(`/SNUpport/s3file/${s3Id}`);
    FileSaver.saveAs(new Blob([new Uint8Array(data.data)], { type: "image/*" }), file.name);
  } catch (e) {
    toastr.error("Le fichier n'a pas pu être téléchargé");
  }
};

export default function View(props) {
  const [ticket, setTicket] = useState();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState();
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const inputRef = React.useRef();

  const { files, addFiles, deleteFile, resetFiles, error } = useFileUpload();

  useEffect(() => {
    if (error) {
      toastr.error(error, "");
    }
  }, [error]);

  const getTicket = async () => {
    try {
      const id = props.match?.params?.id;
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
            files: message.files,
          };
        })
        .filter((message) => message !== undefined);
      setMessages(SNUpportMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setTicket(null);
    }
  };

  useEffect(() => {
    getTicket();
  }, []);

  const send = async () => {
    try {
      setSending(true);
      if (!message) return setSending(false);
      let uploadedFiles;
      if (files.length > 0) {
        const filesResponse = await api.uploadFiles("/SNUpport/upload", files);
        if (!filesResponse.ok) {
          setSending(false);
          const translationKey = filesResponse.code === "FILE_SCAN_DOWN" ? "FILE_SCAN_DOWN_SUPPORT" : filesResponse.code;
          return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(translationKey), { timeOut: 5000 });
        }
        uploadedFiles = filesResponse.data;
      }
      const id = props.match?.params?.id;
      const { ok, code } = await api.post(`/SNUpport/ticket/${id}/message`, { message, fromPage: props.fromPage, files: uploadedFiles });
      if (!ok) {
        capture(new Error(code));
        toastr.error("Oups, une erreur est survenue", translate(code));
      }
      resetFiles();
      setMessage("");
      updateHeightElement(inputRef?.current);
      getTicket();
    } catch (error) {
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    } finally {
      setSending(false);
    }
  };

  if (ticket === undefined) return <Loader />;

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
    if (state === "PENDING")
      return (
        <StateContainer>
          <MailCloseIcon color="#6495ED" style={{ margin: 0, padding: "5px" }} />
          {translateState(state)}
        </StateContainer>
      );
  };

  return (
    <Container style={{ marginBottom: "1rem" }}>
      <BackButtonContainer>
        <BackButton to={`/besoin-d-aide`}>{"<"} Retour</BackButton>
      </BackButtonContainer>
      <div
        style={{
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "calc(95vh - 170px)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          overflow: "hidden",
          borderRadius: "10px",
        }}>
        {ticket && messages ? (
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
                <Message key={message?.id} fromMe={message?.fromMe} from={message?.from} date={message?.date} content={message?.content} files={message?.files} />
              ))}
            </Messages>
          </>
        ) : null}
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
          <ButtonContainer>
            <LoadingButton color="white" onClick={send} disabled={!message || sending}>
              <SendIcon color={!message && "grey"} />
            </LoadingButton>
          </ButtonContainer>
        </InputContainer>
        {sending && files.length > 0 && <div className="mt-1 text-sm text-gray-500">{translate("UPLOAD_IN_PROGRESS")}</div>}
        <FileUpload files={files} addFiles={addFiles} deleteFile={deleteFile} filesAccepted={["jpeg", "png", "pdf", "word", "excel"]} />
      </div>
    </Container>
  );
}

const Message = ({ from, date, content, fromMe, files = [] }) => {
  if (!content || !content.length) return null;
  return fromMe ? (
    <MessageContainer>
      <MessageBubble align={"right"} backgroundColor={colors.darkPurple}>
        <MessageContent color="white" dangerouslySetInnerHTML={{ __html: formatMessageForReadingInnerHTML(content) }}></MessageContent>
        <MessageDate color="#ccc">{date}</MessageDate>
        {files.map((file) => (
          <File
            key={file.name}
            onClick={() => {
              download(file);
            }}
            color="white">
            {file.name}
          </File>
        ))}
      </MessageBubble>
    </MessageContainer>
  ) : (
    <MessageContainer>
      <MessageFrom>{from}</MessageFrom>
      <MessageBubble align={"left"} backgroundColor={colors.lightGrey} color="white">
        <MessageContent dangerouslySetInnerHTML={{ __html: formatMessageForReadingInnerHTML(content) }}></MessageContent>
        <MessageDate>{date}</MessageDate>
        {files.map((file) => (
          <File
            key={file.name}
            onClick={() => {
              download(file);
            }}
            color="white">
            {file.name}
          </File>
        ))}
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

const File = styled.div`
  margin-top: 0.2rem;
  color: ${({ color }) => color};
  font-size: 0.8rem;
  font-weight: 400;
  text-decoration: underline;
  cursor: pointer;
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
