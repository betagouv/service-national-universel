// Champs d'un ticket gardés dans le localStorage (redux-persist, clé « persist:root »). Ce sont des
// valeurs d'énumération qui suffisent à dessiner l'en-tête d'un aperçu : le document complet
// (fil textMessage, notes internes, brouillon, identité et attributs du contact) est rechargé
// depuis l'API à l'ouverture et ne doit pas rester sur le disque du poste (FM21, PM55).
export const PERSISTED_TICKET_FIELDS = ["_id", "status", "contactGroup"];

function pickPersistedFields(ticket) {
  const persisted = {};
  for (const field of PERSISTED_TICKET_FIELDS) {
    if (ticket[field] !== undefined) persisted[field] = ticket[field];
  }
  return persisted;
}

// État des aperçus tel qu'il est écrit dans le localStorage : seuls les aperçus ouverts sont gardés,
// réduits à leurs champs d'en-tête. Les tickets déjà fermés ou sortis des aperçus ouverts ne
// s'accumulent plus d'une session à l'autre.
export function toPersistedTicketPreview(ticketPreview) {
  const openTicketIds = ticketPreview?.openTicketIds || [];
  const tickets = (ticketPreview?.tickets || [])
    .filter((entry) => entry?.ticket?._id && openTicketIds.includes(entry.ticket._id))
    .map(({ ticket }) => ({ ticket: pickPersistedFields(ticket) }));
  const persistedIds = tickets.map(({ ticket }) => ticket._id);
  return {
    isTicketListOpen: Boolean(ticketPreview?.isTicketListOpen),
    tickets,
    openTicketIds: openTicketIds.filter((id) => persistedIds.includes(id)),
    expandedTicketIds: (ticketPreview?.expandedTicketIds || []).filter((id) => persistedIds.includes(id)),
  };
}

// Un aperçu réhydraté n'a que ses champs d'en-tête : il est complet une fois rechargé depuis
// GET /ticket/:id, qui renvoie toujours les étiquettes (jamais persistées).
export function isTicketPreviewLoaded(entry) {
  return Array.isArray(entry?.tags);
}
