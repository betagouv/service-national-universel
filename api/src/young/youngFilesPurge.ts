import { deleteFilesByList, listFiles } from "../utils";

/** Une réponse `listObjects` plafonne à 1 000 clés : on relit le préfixe jusqu'à ce qu'il soit vide. */
const MAX_BATCHES = 20;

/**
 * Supprime tous les objets S3 d'un volontaire : `app/young/<id>/` couvre les pièces du dossier
 * (`files.*`), la préparation militaire, les pièces de candidature et d'équivalence. Renvoie le
 * nombre d'objets supprimés. Lève si le stockage répond en erreur, ou si le préfixe n'est toujours
 * pas vide après MAX_BATCHES passes : l'appelant ne doit alors pas considérer la purge acquise.
 *
 * Remplace, au soft-delete, une boucle sur les caractères du nom de clé qui ne supprimait aucun
 * binaire (constat M48 de l'audit du 21/09/2026).
 */
export async function purgeYoungFiles(youngId: string): Promise<number> {
  const prefix = `app/young/${youngId}/`;
  let deleted = 0;
  for (let batch = 0; batch < MAX_BATCHES; batch++) {
    const objects: Array<{ Key?: string }> = (await listFiles(prefix)) || [];
    const keys = objects.map((object) => object.Key).filter((key): key is string => Boolean(key) && key!.startsWith(prefix));
    if (keys.length === 0) return deleted;
    await deleteFilesByList(keys.map((Key) => ({ Key })));
    deleted += keys.length;
  }
  throw new Error(`Purge S3 inachevée pour le volontaire ${youngId} après ${MAX_BATCHES} passes`);
}
