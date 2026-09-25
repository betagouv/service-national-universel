// M85 / FH17 : PUT /knowledge-base/:id/content enregistrait n'importe quelle URL dans les nœuds
// Slate, rendue ensuite sans filtre sur support.snu.gouv.fr (iframe vidéo `javascript:` exécutée
// sans clic chez chaque lecteur).
const express = require("express");
const request = require("supertest");

const ARTICLE_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = { _id: "bbbbbbbbbbbbbbbbbbbbbbbb", role: "AGENT" };
    next();
  },
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils/sitemap.utils", () => ({ revalidateSiteMap: jest.fn(), formatSectionsIntoSitemap: jest.fn() }));
jest.mock("../utils/index.js", () => ({ uploadPublicPicture: jest.fn(), diacriticSensitiveRegex: (s) => s }));
jest.mock("../models/kbSearch", () => ({}));
jest.mock("../models/knowledgeBase", () => ({ findById: jest.fn() }));

const KnowledgeBaseModel = require("../models/knowledgeBase");
const knowledgeBaseRouter = require("../controllers/knowledgeBase");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/knowledge-base", knowledgeBaseRouter);
  return app;
};

const put = (content) => request(buildApp()).put(`/knowledge-base/${ARTICLE_ID}/content`).send({ content });

describe("PUT /knowledge-base/:id/content : URL des nœuds Slate", () => {
  let article;

  beforeEach(() => {
    jest.clearAllMocks();
    article = { _id: ARTICLE_ID, type: "article", set: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    KnowledgeBaseModel.findById.mockImplementation(() => {
      const result = Promise.resolve(article);
      result.populate = () => ({ lean: () => Promise.resolve(article) });
      return result;
    });
  });

  it("refuse une iframe vidéo en javascript:", async () => {
    const res = await put([{ type: "video", url: "javascript:alert(document.cookie)//", children: [{ text: "" }] }]);
    expect(res.status).toBe(400);
    expect(article.save).not.toHaveBeenCalled();
  });

  it("refuse un lien javascript: imbriqué", async () => {
    const res = await put([{ type: "paragraph", children: [{ type: "link", url: "javascript:alert(1)", children: [{ text: "clic" }] }] }]);
    expect(res.status).toBe(400);
    expect(article.save).not.toHaveBeenCalled();
  });

  it("enregistre un contenu aux URL autorisées", async () => {
    const content = [
      {
        type: "paragraph",
        children: [
          { type: "link", url: "/base-de-connaissance/autre-article", children: [{ text: "interne" }] },
          { type: "link", url: "https://www.snu.gouv.fr", children: [{ text: "externe" }] },
        ],
      },
      { type: "video", url: "https://player.vimeo.com/video/123", children: [{ text: "" }] },
    ];
    const res = await put(content);
    expect(res.status).toBe(200);
    expect(article.set).toHaveBeenCalledWith(expect.objectContaining({ content }));
    expect(article.save).toHaveBeenCalled();
  });
});
