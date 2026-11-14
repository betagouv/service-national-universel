const { inspectShortcut, inspectTicket, inspectMacro, inspectTemplate, inspectKnowledgeBase, summarize } = require("../scripts/auditStoredContent.helpers");

const link = (url) => ({ type: "paragraph", children: [{ type: "link", url, children: [{ text: "lien" }] }] });

describe("auditStoredContent — contrôles par document", () => {
  it("signature : HTML et contenu Slate", () => {
    const doc = { text: `<a href="javascript:alert(1)">x</a>`, content: [link("javascript:alert(1)")], isSignature: true };
    expect(inspectShortcut(doc).map(({ field, reason }) => [field, reason])).toEqual([
      ["text", "url"],
      ["content", "url"],
    ]);
    expect(inspectShortcut({ text: "<p>Cordialement</p>", content: [link("https://www.snu.gouv.fr")] })).toEqual([]);
  });

  it("ticket : brouillon, notes et attributs de contact au format lien", () => {
    const doc = {
      messageDraft: `<img src="https://x.fr/a.png" onerror="alert(1)">`,
      notes: [{ content: "note saine" }, { content: `<iframe src="https://evil.example"></iframe>` }, null],
      contactAttributes: [
        { name: "profil", value: "javascript:alert(1)", format: "link" },
        { name: "classe", value: "javascript:texte", format: "string" },
        { name: "site", value: "www.exemple.fr", format: "link" },
      ],
    };
    expect(inspectTicket(doc).map(({ field, reason }) => [field, reason])).toEqual([
      ["messageDraft", "event-handler"],
      ["notes.1.content", "frame"],
      ["contactAttributes.0.value", "url"],
    ]);
    expect(inspectTicket({})).toEqual([]);
  });

  it("macro : seules les actions qui ajoutent une note sont contrôlées", () => {
    const doc = {
      macroAction: [
        { field: "notes.content", value: `<a href="javascript:alert(1)">x</a>` },
        { field: "status", value: "javascript:alert(1)" },
      ],
    };
    expect(inspectMacro(doc).map(({ field }) => field)).toEqual(["macroAction.0.value"]);
  });

  it("modèle de ticket : message", () => {
    expect(inspectTemplate({ message: `<script>alert(1)</script>` }).map(({ field, reason }) => [field, reason])).toEqual([["message", "script"]]);
  });

  it("article : nœuds Slate (liens internes acceptés) et image d'illustration", () => {
    const doc = { content: [link("/base-de-connaissance/aide"), { type: "video", url: "javascript:alert(1)", children: [{ text: "" }] }], imageSrc: "javascript:alert(1)" };
    expect(inspectKnowledgeBase(doc).map(({ field, type }) => [field, type])).toEqual([
      ["content", "video"],
      ["imageSrc", undefined],
    ]);
  });

  it("résume par collection, champ sans index et motif", () => {
    expect(
      summarize([
        { collection: "ticket", field: "notes.0.content", reason: "url" },
        { collection: "ticket", field: "notes.3.content", reason: "url" },
        { collection: "ticket", field: "messageDraft", reason: "frame" },
      ])
    ).toEqual({ "ticket.notes.content · url": 2, "ticket.messageDraft · frame": 1 });
  });
});
