const express = require("express");

// Les pièces jointes passent par un parseur multipart dédié (middlewares/attachmentUpload.js),
// monté sur les seules routes qui en reçoivent : aucun corps JSON légitime n'approche 1 Mo. À
// 10 Mo, n'importe quel anonyme faisait analyser de gros corps par snupport-api avant même
// l'authentification, y compris sur des routes inexistantes (PL21, audit du 25/09/2026). Aligné
// sur BODY_SIZE_LIMIT de api/src/middlewares/httpHardening.ts.
const BODY_SIZE_LIMIT = "1mb";

function applyJsonBodyParser(app) {
  app.use(express.json({ limit: BODY_SIZE_LIMIT }));
}

module.exports = { BODY_SIZE_LIMIT, applyJsonBodyParser };
