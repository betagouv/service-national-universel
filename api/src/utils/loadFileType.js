// file-type ≥ 17 est ESM-only et ce service est compilé en CommonJS : seul un import() dynamique
// le charge. On ne descend pas sous 21.3.1, qui borne l'analyse d'un en-tête ASF forgé
// (GHSA-5v7r-6r5c-r473) : la 16.5.4, dernière version CommonJS, boucle sans fin dessus — y
// compris derrière un tag ID3, qu'un timeout applicatif ne ferait pas lâcher.
//
// Ce fichier reste volontairement en JavaScript : ts-jest force CommonJS et réécrirait un import()
// écrit dans un .ts en require(), que jest ne sait pas résoudre sur un paquet ESM-only. Contourner
// cela par new Function est fragile : jest réutilise alors le callback d'import d'une suite déjà
// démontée et échoue avec « Test environment has been torn down ». Les tests tournent avec
// --experimental-vm-modules.
module.exports = { loadFileType: () => import("file-type") };
