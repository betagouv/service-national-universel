// Remplace loadFileType.js sous jest (voir moduleNameMapper dans jest.config.js).
//
// Un import() écrit dans un module chargé par jest exige --experimental-vm-modules, dont le surcoût
// mémoire a fait saturer le heap de la CI (suite complète de l'api). Ici l'import() est compilé dans
// le contexte principal de Node (USE_MAIN_CONTEXT_DEFAULT_LOADER) : file-type n'est chargé qu'une
// fois par processus, hors des contextes jest, et aucun drapeau n'est nécessaire.
const path = require("path");
const vm = require("vm");

const importEsm = vm.runInThisContext("(specifier) => import(specifier)", {
  filename: path.join(__dirname, "loadFileType.js"),
  importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
});

module.exports = { loadFileType: () => importEsm("file-type") };
