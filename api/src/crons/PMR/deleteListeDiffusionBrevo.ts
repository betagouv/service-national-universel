import { capture } from "../../sentry";
import slack from "../../slack";
import { deleteDiffusionList } from "../../brevo";

export const handler = async (): Promise<void> => {
  try {
    const folderId = 589; // Créer une variable d'env ???
    const listToDelete = await deleteDiffusionList(folderId);
    slack.info({ title: "DeleteListeDiffusionBrevo", text: `Suppression de ${listToDelete?.length} listes de diffusion Brevo` });
  } catch (e) {
    capture(e);
    slack.error({ title: "DeleteListeDiffusionBrevo", text: JSON.stringify(e) });
    throw e;
  }
};
