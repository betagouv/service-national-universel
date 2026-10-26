import fs from "fs";
import path from "path";

import { isSafeLinkUrl, isSitePath, sanitizeHttpsUrl, sanitizeImageUrl, sanitizeLinkUrl, sanitizeVideoUrl } from "./safeUrl";

type Vectors = Record<string, { accept: (string | null)[]; reject: (string | null)[] }>;
const vectors: Vectors = JSON.parse(fs.readFileSync(path.join(__dirname, "safeUrl.vectors.json"), "utf8"));

const filters: Record<string, (value: string | null) => string | null> = {
  link: (value) => sanitizeLinkUrl(value),
  linkWithSitePath: (value) => sanitizeLinkUrl(value, { allowSitePath: true }),
  image: sanitizeImageUrl,
  video: sanitizeVideoUrl,
  https: sanitizeHttpsUrl,
};

describe("safeUrl — vecteurs partagés", () => {
  it("couvre chaque filtre", () => {
    expect(Object.keys(vectors).filter((key) => !key.startsWith("_"))).toEqual(Object.keys(filters));
  });

  describe.each(Object.keys(filters))("%s", (name) => {
    it.each(vectors[name].accept)("accepte %j", (value) => {
      expect(filters[name](value)).not.toBeNull();
    });
    it.each(vectors[name].reject)("refuse %j", (value) => {
      expect(filters[name](value)).toBeNull();
    });
  });
});

describe("safeUrl — valeur renvoyée", () => {
  it("renvoie l'URL normalisée, sans les espaces", () => {
    expect(sanitizeLinkUrl("  HTTPS://WWW.SNU.GOUV.FR/a  ")).toBe("https://www.snu.gouv.fr/a");
  });

  it("renvoie le chemin interne tel quel, sans les espaces", () => {
    expect(sanitizeLinkUrl(" /base-de-connaissance/a ", { allowSitePath: true })).toBe("/base-de-connaissance/a");
  });

  it("n'accepte un chemin interne qu'avec allowSitePath", () => {
    expect(isSafeLinkUrl("/a")).toBe(false);
    expect(isSafeLinkUrl("/a", { allowSitePath: true })).toBe(true);
    expect(isSitePath("//a")).toBe(false);
  });

  it("ignore les valeurs qui ne sont pas des chaînes", () => {
    expect(sanitizeLinkUrl(undefined)).toBeNull();
    expect(sanitizeLinkUrl({ toString: () => "https://a.fr" } as unknown as string)).toBeNull();
  });
});
