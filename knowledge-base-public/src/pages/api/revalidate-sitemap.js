import { createHash, timingSafeEqual } from "crypto";

// Appelée par snupport-api (src/utils/sitemap.utils.js) en POST, secret dans le corps JSON.
// Le secret était lu dans la query : l'appelant légitime était toujours refusé, et la route restait
// ouverte à tous quand REVALIDATION_TOKEN était absent (undefined !== undefined est faux) — FL8.
const isValidSecret = (secret) => {
  const expected = process.env.REVALIDATION_TOKEN;
  if (!expected || typeof secret !== "string") return false;
  // Comparaison à temps constant ; les empreintes ont la même longueur quelle que soit l'entrée.
  const digest = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(secret), digest(expected));
};

// https://nextjs.org/docs/pages/building-your-application/rendering/incremental-static-regeneration
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check for secret to confirm this is a valid request
  if (!isValidSecret(req.body?.secret)) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await res.revalidate("/base-de-connaissance/sitemap");
    return res.json({ revalidated: true });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating");
  }
}
