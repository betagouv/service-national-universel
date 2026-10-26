// file-type ≥ 17 est ESM-only et ce service est en CommonJS : seul un import() dynamique le charge.
// On ne descend pas sous 21.3.1, qui borne l'analyse d'un en-tête ASF forgé (GHSA-5v7r-6r5c-r473) :
// la 16.5.4, dernière version CommonJS, boucle sans fin dessus — y compris derrière un tag ID3,
// qu'un timeout applicatif ne ferait pas lâcher.
//
// Module à part pour que jest puisse le remplacer (moduleNameMapper dans jest.config.js) : un
// import() dynamique exécuté dans un module jest exige --experimental-vm-modules, dont le surcoût
// mémoire a fait saturer le heap de la CI de l'api (voir api/docs/2026-10-05-file-type-montee-de-version.md).
module.exports = { loadFileType: () => import("file-type") };
