import { capture } from "../../sentry";
import slack from "../../slack";
import { getFolderById, getAllList, getListDetailById, deleteListById } from "../../brevo";

export const handler = async (): Promise<void> => {
  try {
    const folderId = 589; // Créer une variable d'env ???

    const folder = await getFolderById(folderId);
    const folderName = "DEV - Ne Pas Supprimer - WARNING";
    if (!folder || folder?.name !== folderName) throw new Error("ERROR FOLDER NOT FOUND");

    const lists: any[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await getAllList(50, offset);

      const currentLists = response?.lists ?? [];

      if (currentLists.length === 0) {
        hasMore = false;
      } else {
        lists.push(...currentLists);
        offset += 50;
      }
    }

    const listsToDelete: any[] = [];

    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    for (const list of lists) {
      if (list.folderId === folderId) continue;
      const response = await getListDetailById(list.id);

      if (!response?.createdAt) continue;

      const createdAt = new Date(response.createdAt);
      if (createdAt < sixMonthsAgo) {
        listsToDelete.push(list);
        await deleteListById(list.id);
      }
    }
    slack.info({ title: "DeleteListeDiffusionBrevo", text: `Suppression de ${listsToDelete?.length} listes de diffusion Brevo` });
  } catch (e) {
    capture(e);
    slack.error({ title: "DeleteListeDiffusionBrevo", text: JSON.stringify(e) });
    throw e;
  }
};
