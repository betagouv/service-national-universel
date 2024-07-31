import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import dayjs from "@/utils/dayjs.utils";
import { useSelector } from "react-redux";
import { HiSearch, HiX } from "react-icons/hi";

import api from "../../services/api";
import Loader from "../../components/Loader";
import { urlWithScheme } from "../../utils";
import { colors, translateState } from "snu-lib";
import MailCloseIcon from "../../components/MailCloseIcon";
import MailOpenIcon from "../../components/MailOpenIcon";
import SuccessIcon from "../../components/SuccessIcon";
import { referentArticles, adminArticles, structureArticles, visitorArticles, headCenterArticles, administrator_cleArticles, referent_classeArticles } from "./articles";
import plausibleEvent from "../../services/plausible";
import { ROLES } from "snu-lib";

const Dashboard = (props) => {
  const [userTickets, setUserTickets] = useState(null);
  const [articles, setArticles] = useState(null);
  const [kbRole, setKbRole] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  const from = new URLSearchParams(props.location.search).get("from");

  useEffect(() => {
    if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) {
      setArticles(structureArticles);
      setKbRole("structure");
    } else if (user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) {
      setArticles(referentArticles);
      setKbRole("referent");
    } else if (user.role === ROLES.HEAD_CENTER) {
      setArticles(headCenterArticles);
      setKbRole("head_center");
    } else if (user.role === ROLES.VISITOR) {
      setArticles(visitorArticles);
      setKbRole("visitor");
    } else if (user.role === ROLES.TRANSPORTER) {
      setArticles(visitorArticles);
      setKbRole(ROLES.TRANSPORTER);
    } else if (user.role === ROLES.ADMINISTRATEUR_CLE) {
      setArticles(administrator_cleArticles);
      setKbRole(`${user.role}_${user.subRole}`);
    } else if (user.role === ROLES.REFERENT_CLASSE) {
      setArticles(referent_classeArticles);
      setKbRole("referent_classe");
    } else {
      setArticles(adminArticles);
      setKbRole("admin");
    }
    const fetchTickets = async () => {
      try {
        const { ok, data } = await api.get(`/SNUpport/tickets`);
        if (!ok) return setUserTickets([]);
        setUserTickets(data);
      } catch (error) {
        setUserTickets([]);
      }
    };
    fetchTickets();
  }, []);

  const KnowledgeBaseSearch = ({ path, showAllowedRoles, noAnswer, placeholder = "Comment pouvons-nous vous aider ?", className = "" }) => {
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
        const response = await api.get(`/SNUpport/knowledgeBase/search?search=${search}&restriction=${kbRole}`);
        setIsSearching(false);
        if (response.ok) {
          setItems(response.data);
        }
      }, 250);
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
    <HeroContainer>
      <Container>
        <h3 style={{ textAlign: "center" }}>Besoin d&apos;aide&nbsp;?</h3>
        <div className=" mt-2 mr-auto ml-auto flex w-full content-center items-center justify-center md:w-2/3 md:flex-1">
          <KnowledgeBaseSearch path="/base-de-connaissance" className="rounded-md border border-gray-300 transition-colors focus:border-gray-400" />
        </div>
        <div className="m-auto !mt-3 w-2/3 text-center" style={{ color: "#6B7280" }}>
          <strong>Une question ? </strong> Utilisez notre moteur de recherche ci-dessus pour trouver l'article ou le tutoriel pour vous aider. Pour faciliter vos recherches
          utilisez <strong>des mots clés</strong> (ex : inscriptions, contrat d'engagement …)
        </div>
        {articles?.length > 0 && (
          <>
            <h4 className="my-4 ml-2">Quelques articles pour vous aider&nbsp;:</h4>
            <ArticlesBlock articles={articles} />
          </>
        )}
        <hr style={{ margin: "2rem" }} />
        <h4 style={{ textAlign: "center" }}>Vous n&apos;avez pas trouvé de réponse à votre demande?</h4>

        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280" }}>
              Contactez nos équipes. Nous travaillons généralement du <strong>lundi au vendredi de 9h00 à 18h00</strong> et traiterons votre demande dès que possible. Vous recevrez
              une réponse par mail.
            </div>
            <div className="buttons mt-4">
              <InternalLink onClick={() => plausibleEvent("Besoin d'aide - Contacter quelqu'un")} to={`/besoin-d-aide/ticket?from=${from}`}>
                Contacter&nbsp;quelqu&apos;un
              </InternalLink>
            </div>
          </div>
        </div>
      </Container>
      {![ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) && (
        <>
          <h4 style={{ marginLeft: "0.5rem" }}>Mes conversations :</h4>
          <List>
            <section className="ticket titles">
              <p>Nº demande</p>
              <p>Sujet</p>
              <p>Etat</p>
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
                  <div className="ticket-date">{dayjs(new Date(ticket.updatedAt)).fromNow()}</div>
                </NavLink>
              ))}
          </List>
        </>
      )}
    </HeroContainer>
  );
};

export default Dashboard;

export const ArticlesBlock = ({ articles }) => (
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
);

const StateContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-width: 1300px;
  margin: 0 auto;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
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
    color: #fff;
    background: #463bad;
  }
`;

const InternalLink = styled(NavLink)`
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
