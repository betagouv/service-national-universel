const fs = require("fs");
const path = require("path");

const { sanitizeHttpsUrl, sanitizeImageUrl, sanitizeLinkUrl, sanitizeVideoUrl } = require("../utils/safeUrl");

// Vecteurs partagés avec snu-lib (GOO-19) : cette copie du filtre doit se comporter comme la référence.
const vectors = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../packages/lib/src/utils/safeUrl.vectors.json"), "utf8"));

const filters = {
  link: (value) => sanitizeLinkUrl(value),
  linkWithSitePath: (value) => sanitizeLinkUrl(value, { allowSitePath: true }),
  image: sanitizeImageUrl,
  video: sanitizeVideoUrl,
  https: sanitizeHttpsUrl,
};

describe("safeUrl — vecteurs partagés de snu-lib", () => {
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
