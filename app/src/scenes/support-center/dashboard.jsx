import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { HiSearch, HiX } from "react-icons/hi";

import { HeroContainer } from "../../components/Content";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { colors, translateState, urlWithScheme } from "../../utils";
import MailCloseIcon from "../../components/MailCloseIcon";
import MailOpenIcon from "../../components/MailOpenIcon";
import SuccessIcon from "../../components/SuccessIcon";
import { supportURL } from "../../config";
import plausibleEvent from "../../services/plausible";
import ModalForm from "../../components/modals/ModalForm";
import { useHistory } from "react-router-dom";

const articles = [
  {
    title: "SNU phase 0 : Le parcours des inscriptions",
    emoji: "📄",
    body: `Rédaction du dossier d'inscription : Le jeune remplit son dossier...`,
    url: `${supportURL}/base-de-connaissance/phase-0-le-parcours-des-inscriptions`,
  },
  {
    title: "Phase 1 : L'organisation du séjour de cohésion",
    emoji: "🌲",
    body: `Lorsque l'inscription du volontaire est validée, il entre dans la phase 1...`,
    url: `${supportURL}/base-de-connaissance/phase-1-lorganisation-du-sejour-de-cohesion`,
  },
  {
    title: "Phase 2 : Le parcours d'une MIG",
    emoji: "🤝",
    body: `La publication d'une MIG : la structure s'inscrit sur la plateforme...`,
    url: `${supportURL}/base-de-connaissance/phase-2-le-parcours-dune-mig`,
  },
];

const KnowledgeBaseSearch = ({ path, showAllowedRoles, noAnswer, placeholder = "Lancez votre recherche par mots clés", className = "" }) => {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState([]);
  const [hideItems, setHideItems] = useState(false);

  const searchTimeout = useRef(null);

  const computeSearch = () => {
    if (search.length > 0 && !isSearching) setIsSearching(true);
    if (!search.length) {
      setIsSearching(false);
      setSearch("");
      clearTimeout(searchTimeout.current);
      setItems([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      setHideItems(false);
      const response = await api.get(`/zammood/knowledgeBase/search?search=${search}&restriction=young`);
      setIsSearching(false);
      if (response.ok) {
        setItems(response.data);
      }
    }, 1000);
  };

  useEffect(() => {
    computeSearch();
    return () => {
      clearTimeout(searchTimeout.current);
      setIsSearching(false);
    };
  }, [search]);

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full items-center">
        <input
          className={`w-full py-2.5 pl-10 pr-3 text-sm text-gray-500 transition-colors ${className}`}
          type="text"
          placeholder={placeholder}
          onClick={() => plausibleEvent("Besoin d'aide - Barre de recherche")}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <span className="material-icons absolute right-2 text-xl text-red-400" onClick={() => setSearch("")}>
          <HiX />
        </span>
        <span className="material-icons absolute left-3 text-xl text-gray-400">
          <HiSearch />
        </span>
      </div>
      <div className="relative flex w-full items-center">
        {!hideItems && (search.length > 0 || isSearching || items.length) > 0 && (
          <div className="absolute top-0 left-0 z-20 max-h-80 w-full overflow-auto bg-white">
            {search.length > 0 && isSearching && !items.length && <Loader size={20} className="my-4" />}
            {search.length > 0 && !isSearching && !items.length && <span className="block py-2 px-8 text-sm text-black">{noAnswer}</span>}
            {items?.map((item) => (
              <KnowledgeBaseArticleCard
                key={item._id}
                _id={item._id}
                position={item.position}
                title={item.type === "article" ? item.title : `📂 ${item.title}`}
                slug={item.slug}
                path={path}
                allowedRoles={showAllowedRoles ? item.allowedRoles : []}
                className="!my-0"
                contentClassName="!py-2 !shadow-none !rounded-none border-b-2"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KnowledgeBaseArticleCard = ({ _id, position, title, slug, path, className = "" }) => {
  return (
    <div key={_id}>
      <a
        href={`https://support.snu.gouv.fr/${path}/${slug}`}
        target="_blank"
        rel="noreferrer"
        data-position={position}
        data-id={_id}
        className={`my-1 w-full shrink-0 grow-0 lg:my-4 ${className}`}>
        <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg `}>
          <div className="flex flex-grow flex-col">
            <header className="flex items-center justify-between px-8 leading-tight">
              <h3 className="text-lg text-black">{title}</h3>
            </header>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-6 h-4 w-4 shrink-0 grow-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </article>
      </a>
    </div>
  );
};

export default function Dashboard(props) {
  const [userTickets, setUserTickets] = useState(null);
  const fromPage = new URLSearchParams(props.location.search).get("from ");
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  dayjs.extend(relativeTime).locale("fr");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { ok, data } = await api.get(`/zammood/tickets`);
        if (!ok) return setUserTickets([]);
        setUserTickets(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTickets();
  }, []);

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
  /* @ts-ignore */
  // @ts-nocheck
  /* tslint:disable */

  return (
    <HeroContainer>
      <Container>
        <h3 className="text-center text-[32px]">Besoin d&apos;aide&nbsp;?</h3>
        <div className=" mt-2 mr-auto ml-auto flex w-full content-center items-center justify-center md:w-2/3 md:flex-1">
          <KnowledgeBaseSearch path="/base-de-connaissance" className="rounded-md border border-gray-300 transition-colors focus:border-gray-400" restriction="public" />
        </div>
        <div className="m-auto !mt-3 w-2/3 text-center " style={{ color: "#6B7280" }}>
          <strong>Une question ? </strong> Utilisez notre moteur de recherche ci-dessus pour trouver l&apos;article ou le tutoriel pour vous aider. Pour faciliter vos recherches
          utilisez <strong>des mots clés</strong> (ex : inscriptions, contrat d&apos;engagement …)
        </div>
        <h4 className="my-4 ml-2">Quelques articles pour vous aider&nbsp;:</h4>
        <Articles>
          {articles?.map((article) => (
            <div className="block" key={article.url} onClick={() => window.open(article.url)}>
              <div className="block-title">
                <p>{article.emoji}</p>
                <h6>{article.title}</h6>
              </div>
              <p>{article.body}</p>
              <p>
                <a className="block-link" href={urlWithScheme(article.url)} target="_blank" rel="noreferrer">
                  Lire la suite
                </a>
              </p>
            </div>
          ))}
        </Articles>
        <hr style={{ margin: "2rem" }} />
        <h4 style={{ textAlign: "center" }}>Vous n&apos;avez pas trouvé de réponse à votre demande?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280" }}>
              Contactez nos équipes. Nous travaillons généralement du <strong>lundi au vendredi de 9h00 à 18h00</strong> et traiterons votre demande dès que possible. Vous recevrez
              une réponse par mail.
            </div>
            <div className="buttons mt-4">
              <LinkButton
                onClick={() => {
                  plausibleEvent("Besoin d'aide - Contacter quelqu'un");
                  setIsOpen(true);
                }}>
                Contacter&nbsp;quelqu&apos;un
              </LinkButton>
              <ModalForm
                isOpen={isOpen}
                onClose={() => {
                  setIsOpen(false);
                  history.push(`/besoin-d-aide/ticket?from=${fromPage}`);
                }}
              />
            </div>
          </div>
        </div>
      </Container>

      <h4 style={{ marginLeft: "0.5rem" }}>Mes conversations en cours</h4>
      <List>
        <section className="ticket titles">
          <p>Nº demande</p>
          <p>Sujet</p>
          <p>État</p>
          <p className="ticket-date">Dernière mise à jour</p>
        </section>
        {!userTickets ? <Loader /> : null}
        {userTickets?.length === 0 ? <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div> : null}
        {userTickets
          ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          ?.map((ticket) => (
            <NavLink to={`/besoin-d-aide/ticket/${ticket._id}`} key={ticket._id} className="ticket">
              <p>{ticket.number}</p>
              <p>{ticket.subject}</p>
              <p>{displayState(ticket.status)}</p>
              <p className="ticket-date">{dayjs(new Date(ticket.updatedAt)).fromNow()}</p>
            </NavLink>
          ))}
      </List>
    </HeroContainer>
  );
}

const StateContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  .help-section {
    padding: 0.5rem;
    margin-bottom: 1rem;
    width: 50%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;

    .buttons {
      margin: 1rem 0;
      flex: 1;
    }
  }
  .help-section-block {
    display: grid;
    grid-template-rows: 1fr 1fr;
    text-align: center;
  }
  ${
    "" /* .help-section-text {
    flex: 3;
  } */
  }
  .link {
    color: #6b7280;
    :hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 1024px) {
    .help-section {
      flex-direction: column;
      align-items: center;
    }
    .help-section-text {
      text-align: center;
    }
  }
`;

const LinkButton = styled.a`
  max-width: 230px;
  margin: 0.3rem;
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    cursor: pointer;
    color: #fff;
    background: #463bad;
  }
`;

const Articles = styled.div`
  min-width: 330px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .block {
    background-color: #fff;
    flex: 1;
    flex-basis: 230px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.3rem;
    margin: 0.5rem;
    box-shadow: 0 0 15px -3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    :hover {
      box-shadow: 0 0 15px 3px rgba(0, 0, 0, 0.2);
    }
    border-radius: 0.5rem;
  }
  .block-title {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .block-title h6 {
    padding-left: 0.8rem;
    margin: 0;
  }
  .block p,
  .block a {
    margin: 0;
    font-size: 0.9rem;
  }
  .block-link {
    color: ${colors.purple};
    :hover {
      text-decoration: underline;
    }
  }
`;

const List = styled.div`
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
  .ticket {
    border-bottom: 1px solid #f1f1f1;
    color: black;
    padding: 1rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr;
    grid-template-rows: 1fr;
    :not(:first-child):hover {
      background-color: #f1f1f1 !important;
    }
  }
  .ticket p {
    margin: 0;
    padding: 0.5rem;
  }
  .ticket-date {
    justify-self: end;
  }
  .titles {
    font-weight: bold;
  }
`;
