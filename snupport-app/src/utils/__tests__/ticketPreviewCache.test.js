import { test } from "node:test";
import assert from "node:assert/strict";
import { isTicketPreviewLoaded, toPersistedTicketPreview } from "../ticketPreviewCache.js";

function fullTicket(_id) {
  return {
    _id,
    status: "OPEN",
    contactGroup: "young",
    subject: "Ma pièce d'identité",
    contactEmail: `${_id}@example.org`,
    contactFirstName: "Camille",
    contactLastName: "Martin",
    contactAttributes: [{ name: "lien vers profil", value: "https://admin.example/volontaire/1" }],
    textMessage: ["<p>Voici ma situation médicale</p>"],
    notes: [{ content: "note interne", authorName: "Agent" }],
    messageDraft: "Bonjour, ",
  };
}

function entry(_id) {
  return { ticket: fullTicket(_id), tags: [{ name: "urgent" }], messages: [{ text: "fil" }], signature: "Cordialement" };
}

test("toPersistedTicketPreview ne garde des aperçus ouverts que les champs d'en-tête", () => {
  const persisted = toPersistedTicketPreview({
    isTicketListOpen: true,
    tickets: [entry("a"), entry("b")],
    openTicketIds: ["a", "b"],
    expandedTicketIds: ["b"],
  });

  assert.deepEqual(persisted, {
    isTicketListOpen: true,
    tickets: [{ ticket: { _id: "a", status: "OPEN", contactGroup: "young" } }, { ticket: { _id: "b", status: "OPEN", contactGroup: "young" } }],
    openTicketIds: ["a", "b"],
    expandedTicketIds: ["b"],
  });
  const serialized = JSON.stringify(persisted);
  for (const leaked of ["textMessage", "notes", "messageDraft", "contactEmail", "contactFirstName", "contactAttributes", "subject", "fil", "Cordialement", "urgent"]) {
    assert.equal(serialized.includes(leaked), false, `${leaked} ne doit pas être persisté`);
  }
});

test("toPersistedTicketPreview élague les tickets sortis des aperçus ouverts", () => {
  const persisted = toPersistedTicketPreview({
    isTicketListOpen: false,
    tickets: [entry("a"), entry("b"), entry("c")],
    openTicketIds: ["c", "zombie"],
    expandedTicketIds: ["a", "c"],
  });

  assert.deepEqual(
    persisted.tickets.map(({ ticket }) => ticket._id),
    ["c"]
  );
  assert.deepEqual(persisted.openTicketIds, ["c"]);
  assert.deepEqual(persisted.expandedTicketIds, ["c"]);
});

test("toPersistedTicketPreview tolère un état absent ou incomplet", () => {
  const empty = { isTicketListOpen: false, tickets: [], openTicketIds: [], expandedTicketIds: [] };
  assert.deepEqual(toPersistedTicketPreview(undefined), empty);
  assert.deepEqual(toPersistedTicketPreview({ tickets: [{ ticket: null }, {}], openTicketIds: [] }), empty);
});

test("toPersistedTicketPreview est idempotent (réhydratation d'un cache déjà réduit)", () => {
  const once = toPersistedTicketPreview({ isTicketListOpen: true, tickets: [entry("a")], openTicketIds: ["a"], expandedTicketIds: ["a"] });
  assert.deepEqual(toPersistedTicketPreview(once), once);
});

test("isTicketPreviewLoaded distingue un aperçu réhydraté d'un aperçu rechargé depuis l'API", () => {
  const [rehydrated] = toPersistedTicketPreview({ tickets: [entry("a")], openTicketIds: ["a"] }).tickets;
  assert.equal(isTicketPreviewLoaded(rehydrated), false);
  assert.equal(isTicketPreviewLoaded(undefined), false);
  assert.equal(isTicketPreviewLoaded({ ...rehydrated, ticket: fullTicket("a"), tags: [] }), true);
});
