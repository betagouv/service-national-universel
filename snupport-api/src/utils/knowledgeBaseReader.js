// Lecture des articles réservés à un rôle de la base de connaissance (M86).
// Les routes publiques de lecture recevaient le rôle du lecteur dans l'URL (`/:allowedRole/...`) et
// le croyaient : un anonyme lisait les articles réservés aux admins ou aux référents en tapant
// `/knowledge-base/admin`. snupport-api ne voit pas la session SNU (la KB n'envoie pas de cookie,
// FH16) ; la preuve du rôle est donc un jeton de lecture signé ici, demandé par l'API v1 avec sa clé
// d'API au moment où elle authentifie le lecteur (`GET /signin/token`), et qui ne porte que la
// liste des rôles lisibles.
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { config } = require("../config");

const PUBLIC_ROLE = "public";
// Le rôle `admin` n'est pas un rôle comme les autres : la recherche le traite comme « tous les rôles ».
const ADMIN_ROLE = "admin";

const KNOWLEDGE_BASE_ROLES = [
  PUBLIC_ROLE,
  "young",
  "young_cle",
  "structure",
  "referent",
  "referent_sanitaire",
  "head_center",
  "head_center_adjoint",
  "visitor",
  "transporter",
  "referent_classe",
  ADMIN_ROLE,
  "administrateur_cle",
  "administrateur_cle_coordinateur_cle",
  "administrateur_cle_referent_etablissement",
  "responsible",
];

const READER_TOKEN_SCHEME = "KnowledgeBaseReader";
const READER_TOKEN_AUDIENCE = "knowledge-base-reader";
// Une journée de travail : le jeton est redemandé à chaque chargement de la KB.
const READER_TOKEN_MAX_AGE = 8 * 60 * 60;

// Clé dérivée : un jeton de lecture ne peut pas passer pour une session agent, signée avec JWT_SECRET.
const readerTokenKey = () => crypto.createHmac("sha256", config.JWT_SECRET).update(READER_TOKEN_AUDIENCE).digest();

const signReaderToken = (roles) =>
  jwt.sign({ roles: [...new Set(roles)] }, readerTokenKey(), { audience: READER_TOKEN_AUDIENCE, expiresIn: READER_TOKEN_MAX_AGE, algorithm: "HS256" });

/** Rôles lisibles portés par l'en-tête `Authorization: KnowledgeBaseReader <jeton>`, ou [] s'il est absent ou invalide. */
const getReaderRoles = (req) => {
  const header = req.get("Authorization");
  if (typeof header !== "string") return [];
  const [scheme, token] = header.split(" ");
  if (scheme !== READER_TOKEN_SCHEME || !token) return [];
  try {
    const payload = jwt.verify(token, readerTokenKey(), { audience: READER_TOKEN_AUDIENCE, algorithms: ["HS256"] });
    return Array.isArray(payload.roles) ? payload.roles.filter((role) => KNOWLEDGE_BASE_ROLES.includes(role)) : [];
  } catch {
    return [];
  }
};

module.exports = {
  PUBLIC_ROLE,
  ADMIN_ROLE,
  KNOWLEDGE_BASE_ROLES,
  READER_TOKEN_SCHEME,
  READER_TOKEN_MAX_AGE,
  signReaderToken,
  getReaderRoles,
};
