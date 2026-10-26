/**
 * Pièces jointes des tickets support (lot S de l'audit du 21/09/2026 : M36, M38).
 *
 * Le client déclarait lui-même `files[].path` et `files[].url` en créant un message : il pouvait
 * rattacher à son ticket n'importe quel objet du bucket support (celui d'un autre ticket, dès que
 * son chemin était connu) ou faire afficher un lien externe aux agents comme pièce jointe.
 *
 * Désormais `POST /SNUpport/upload` enregistre ici, pour l'utilisateur qui dépose, ce qu'il vient
 * de créer ; les routes de message ne relaient que ces enregistrements, retrouvés par leur `path`
 * et consommés au passage. Le `name` et l'`url` transmis au support sont ceux du serveur, jamais
 * ceux du client.
 *
 * Tout vit dans le Redis de l'API : les instances partagent ainsi les dépôts et le quota.
 */
import { getRedisClient } from "../redis";

export type SupportAttachment = { name: string; url: string; path: string };

/** Délai laissé entre le dépôt et l'envoi du message qui le référence. */
const ATTACHMENT_TTL_SECONDS = 24 * 60 * 60;

/** Nombre de fichiers acceptés dans une même requête de dépôt. */
export const MAX_FILES_PER_UPLOAD = 10;
/** Nombre de fichiers qu'un utilisateur peut déposer par fenêtre de UPLOAD_QUOTA_WINDOW_SECONDS. */
export const UPLOAD_QUOTA_PER_WINDOW = 20;
const UPLOAD_QUOTA_WINDOW_SECONDS = 60 * 60;

const attachmentKey = (userId: string, path: string) => `snupportAttachment:${userId}:${path}`;

/**
 * Consomme `count` dépôts sur le quota de l'utilisateur. Fenêtre fixe : la clé porte le numéro de
 * fenêtre, elle expire d'elle-même et un échec de `expire` ne peut pas bloquer l'utilisateur
 * au-delà de la fenêtre suivante.
 *
 * @returns faux si le quota est dépassé (les fichiers de la requête ne doivent pas être stockés).
 */
export async function consumeUploadQuota(userId: string, count: number, now: number = Date.now()): Promise<boolean> {
  const client = getRedisClient();
  const window = Math.floor(now / (UPLOAD_QUOTA_WINDOW_SECONDS * 1000));
  const key = `snupportUploadQuota:${userId}:${window}`;
  const total = await client.incrBy(key, count);
  await client.expire(key, UPLOAD_QUOTA_WINDOW_SECONDS);
  return total <= UPLOAD_QUOTA_PER_WINDOW;
}

/** Enregistre un fichier que l'utilisateur vient de déposer. */
export async function rememberAttachment(userId: string, attachment: SupportAttachment): Promise<void> {
  await getRedisClient().setEx(attachmentKey(userId, attachment.path), ATTACHMENT_TTL_SECONDS, JSON.stringify(attachment));
}

/**
 * Retrouve et consomme les dépôts de l'utilisateur désignés par `paths`.
 *
 * @returns les enregistrements serveur, ou `null` si un seul chemin n'est pas un dépôt de cet
 *          utilisateur encore disponible (inconnu, déposé par un autre, expiré ou déjà utilisé).
 *          Rien n'est consommé dans ce cas.
 */
export async function claimAttachments(userId: string, paths: string[]): Promise<SupportAttachment[] | null> {
  const client = getRedisClient();
  const uniquePaths = [...new Set(paths)];
  const attachments: SupportAttachment[] = [];
  for (const path of uniquePaths) {
    const raw = await client.get(attachmentKey(userId, path));
    if (!raw) return null;
    attachments.push(JSON.parse(raw));
  }
  for (const path of uniquePaths) {
    // Deux requêtes concurrentes peuvent lire le même dépôt : seule celle qui le supprime l'utilise.
    if (!(await client.del(attachmentKey(userId, path)))) return null;
  }
  return attachments;
}
