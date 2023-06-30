import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { HeroContainer } from "../../components/Content";
import { supportURL } from "../../config";
import { colors, urlWithScheme } from "../../utils";
import { HiSearch, HiX } from "react-icons/hi";
import Loader from "../../components/Loader";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";

import ZammoodForm from "./form";
import ModalForm from "../../components/modals/ModalForm";

const articles = [
  {
    title: "Mon affectation (lieu de séjour)",
    emoji: "🗺️",
    body: `Votre séjour de cohésion se déroule dans un centre d'accueil de votre région, ...`,
    url: `${supportURL}/base-de-connaissance/mon-affectation-lieu-de-sejour`,
  },
  {
    title: "Le transport",
    emoji: "🚌",
    body: `Concernant le transport pour le séjour de cohésion, ...`,
    url: `${supportURL}/base-de-connaissance/le-transport`,
  },
  {
    title: "Les documents à fournir",
    emoji: "📋",
    body: `Les documents du formulaire d'inscription, ...`,
    url: `${supportURL}/base-de-connaissance/les-documents-a-fournir`,
  },
  {
    title: "Dans ma valise : matériel (trousseau)",
    emoji: "🧳",
    body: `Que dois-je emporter ? Un trousseau indicatif et national sera publié sur votre espace volontaire...`,
    url: `${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau`,
  },
  {
    title: "Je me connecte à mon compte",
    emoji: "🔐",
    body: `Pour vous connecter : rendez-vous sur...`,
    url: `${supportURL}/base-de-connaissance/je-me-connecte-a-mon-compte`,
  },
  {
    title: "J'ai oublié mon identifiant (mail)",
    emoji: "⛔",
    body: `La plateforme bloque la création de nouveau dossier d'inscription...`,
    url: `${supportURL}/base-de-connaissance/comment-recuperer-mon-identifiant-dossier-deja-inscrit`,
  },
  {
    title: "Pendant le séjour (Règles et informations)",
    emoji: "🌲",
    body: `...`,
    url: `${supportURL}/base-de-connaissance/pendant-le-sejour-regles-et-informations`,
  },
  {
    title: "Pourrais-je quitter le centre pendant le séjour ?",
    emoji: "🏃",
    body: `Pour des soucis d'organisation, il n'est pas possible de déroger aux dates prévues pour le séjour de cohésion...`,
    url: `${supportURL}/base-de-connaissance/pourrais-je-quitter-le-centre-pendant-le-sejour`,
  },
  {
    title: "Je me désiste du SNU",
    emoji: "🙁",
    body: `Attention cette action est irréversible, et annule votre entière participation au parcours du SNU. Vous ne pourrez pas revenir en arrière.`,
    url: `${supportURL}/base-de-connaissance/je-me-desiste-du-snu`,
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
      const response = await api.get(`/zammood/knowledgeBase/search?search=${search}&restriction=public`);
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

export default function Index(props) {
  const young = useSelector((state) => state.Auth.young);
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const fromPage = new URLSearchParams(props.location.search).get("from");

  return (
    <HeroContainer style={{ paddingBottom: "5rem" }}>
      <Container style={{ backdropFilter: "blur(6px)" }}>
        {!young && (
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6B7280" }}>
            Vous avez déjà un compte sur le site du SNU ?{" "}
            <Link to="/auth/signin" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        )}
        <h3 className="!mt-3 text-center text-[32px]">Besoin d&apos;aide&nbsp;?</h3>
        <div className=" mt-2 mr-auto ml-auto flex w-full content-center items-center justify-center md:w-2/3 md:flex-1">
          <KnowledgeBaseSearch path="/base-de-connaissance" className="rounded-md border border-gray-300 transition-colors focus:border-gray-400" restriction="public" />
        </div>
        <div className="m-auto !mt-3 w-2/3 text-center " style={{ color: "#6B7280" }}>
          <strong>Une question ? </strong> Utilisez notre moteur de recherche ci-dessus pour trouver l&apos;article ou le tutoriel pour vous aider. Pour faciliter vos recherches
          utilisez <strong>des mots clés</strong> (ex : inscriptions, contrat d&apos;engagement …)
        </div>
      </Container>
      <h4 style={{ margin: "1rem 0", textAlign: "center" }}>Quelques articles pour vous aider</h4>
      <Articles>
        {articles.map((article) => (
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
      <hr style={{ margin: "3rem auto", maxWidth: "600px" }} />
      <Container>
        <h4 style={{ textAlign: "center" }}>Vous n&apos;avez pas trouvé de réponse à votre demande&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280", marginBottom: "0.5rem" }}>
              Contactez nos équipes. Nous travaillons généralement du <strong>lundi au vendredi de 9h00 à 18h00</strong> et traiterons votre demande dès que possible. Vous recevrez
              une réponse par mail.
            </div>
            <div className="bda-container">
              <LinkButton
                onClick={() => {
                  plausibleEvent("Besoin d'aide - Contacter quelqu'un");
                  setOpen(true);
                  setIsOpen(true);
                }}>
                Contacter quelqu&apos;un
              </LinkButton>
            </div>
            <ModalForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
        {open && <ZammoodForm setOpen={setOpen} setSuccessMessage={setSuccessMessage} fromPage={fromPage} />}
        {successMessage && <p style={{ color: "#6B7280" }}>{successMessage}</p>}
      </Container>
    </HeroContainer>
  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .help-section {
    padding: 0.5rem;
    margin: 1rem auto;
    max-width: 600px;
    .buttons {
      margin: 0.8rem 0;
      flex: 1;
    }
    .bda-container {
      margin-top: 0.7rem;
      flex: 1;
    }
  }
  .help-section-block {
    display: grid;
    grid-template-rows: 2fr 1fr;
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
    cursor: pointer;
    color: #fff;
    background: #463bad;
  }
`;

const Articles = styled.div`
  min-width: 330px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  .block {
    height: 190px;
    max-width: 285px;
    min-width: 285px;
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
