import API from "./api";

// Le cache SWR reste en mémoire : il était auparavant recopié dans le sessionStorage, avec la
// réponse de /signin/token (profil complet d'un jeune, santé et représentants légaux compris),
// lisible par tout script de la page (FL9). On efface la copie laissée par les versions précédentes.
if (typeof window !== "undefined") {
  try {
    window.sessionStorage.removeItem("snu-user-cache");
  } catch (error) {
    // Stockage indisponible (navigation privée, cookies bloqués) : rien à effacer.
  }
}

const swrConfigOptions = {
  fetcher: API.swrFetcher,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404.
    if (error.status === 404) return;
    if (error.status === 401) return;

    // Only retry up to 10 times.
    if (retryCount >= 2) return;
    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

export default swrConfigOptions;
