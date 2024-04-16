const path = require("path");
const PDFDocument = require("pdfkit");
const { PUBLIC_ROOTDIR, FONT_ROOTDIR } = require("../config");
const datefns = require("date-fns");

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;
const FONT_ITALIC = `${FONT}_Italic`;

const FILL_COLOR = "#444";
const LIST_INDENT = 15;
const MARGIN = 75;
const SVG_BOX_PATH = "M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z";
const SVG_CHECK_PATH = "M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z";

function render(doc, young) {
  doc.registerFont(FONT, path.join(FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));
  doc.registerFont(FONT_ITALIC, path.join(FONT_ROOTDIR, "Marianne/Marianne-Regular_Italic.woff"));

  const hasParent2 = young.parent2Status !== undefined && young.parent2Status !== null && young.parent2Status.trim().length > 0;
  const allow = young.parent1AllowImageRights === "true" && (!hasParent2 || young.parent2AllowImageRights === "true");

  doc.font(FONT);

  doc.image(path.join(PUBLIC_ROOTDIR, "images/republique-francaise.png"), 0, 0);
  doc.image(path.join(PUBLIC_ROOTDIR, "images/logo-snu.png"), 100, 15, { width: 40, height: 40 });

  doc.fontSize(11).fillColor("#385EA9").text("AUTORISATION DE PRISE DE VUES D’UN MINEUR ET D’UTILISATION D'IMAGES", {
    paragraphGap: 10,
    align: "center",
  });

  doc
    .fillColor(FILL_COLOR)
    .font(FONT_ITALIC)
    .fontSize(8)
    .text(
      `Cette autorisation requiert la signature des 2 représentants légaux pour être effective. A défaut d’avoir les 2 signatures, le volontaire ne pourra être pris en photo, ni filmé et son témoignage ne pourra pas être partagé au sein de la communauté SNU.`,
    );

  doc.moveDown();

  doc.fontSize(10).font(FONT_BOLD).text("Je, soussigné(e), représentant légal n°1 : ", { continued: true }).font(FONT).text(`${young.parent1FirstName} ${young.parent1LastName}`);

  doc.moveDown();

  if (!hasParent2) {
    doc.font(FONT_BOLD).text("Représentant légal de ", { continued: true }).font(FONT).text(`${young.firstName} ${young.lastName}`);

    doc.moveDown();
  } else {
    doc.font(FONT_BOLD).text("Je, soussigné(e), représentant légal n°2 : ", { continued: true }).font(FONT).text(`${young.parent2FirstName} ${young.parent2LastName}`);

    doc.moveDown();

    doc.font(FONT_BOLD).text("Représentants légaux de ", { continued: true }).font(FONT).text(`${young.firstName} ${young.lastName}`);

    doc.moveDown();
  }

  doc.save().translate(150, doc.y).path(SVG_BOX_PATH).restore();
  doc.save().translate(350, doc.y).path(SVG_BOX_PATH).restore();
  doc
    .save()
    .translate(allow ? 150 : 350, doc.y)
    .path(SVG_CHECK_PATH)
    .restore();

  doc.text(hasParent2 ? " autorisons " : " autorise ", 170, undefined, { continued: true });
  doc.text(hasParent2 ? " n'autorisons pas " : " autorisons ", 315, undefined);

  doc.moveDown();

  doc
    .font(FONT_BOLD)
    .text(
      `le Ministère de l’Education Nationale et de la Jeunesse (MENJ), ses services déconcentrés, ses partenaires et les journalistes dûment accrédités par les services de communication du ministère à enregistrer, reproduire et représenter l’image ou la voix du volontaire représenté en partie ou en intégralité, ensemble ou séparément, sur leurs publications respectives.`,
      MARGIN,
    );

  doc.moveDown();

  doc
    .font(FONT)
    .text(
      `Cette autorisation est valable pour une utilisation sur l’ensemble du parcours du service national universel, tant durant le séjour de cohésion que dans le cadre de la mobilisation du volontaire au titre de la réserve du SNU :`,
    );

  doc.moveDown();

  doc.list(
    [
      `d’une durée de 5 ans à compter de la signature de la présente ;`,
      `sur tous les supports d’information et de communication imprimés ou numériques à but non lucratif ;`,
      `édités par les services de l’État ainsi que sur tous réseaux de communication, y compris télévisuels ou Internet ;`,
      `de l’image du volontaire représenté en tant que telle et/ou intégrée dans une œuvre papier, numérique ou audiovisuelle.`,
    ],
    doc.x + LIST_INDENT,
    undefined,
    { bulletRadius: 1.5, textIndent: LIST_INDENT, baseline: -8 },
  );

  doc.moveDown();

  doc
    .text(
      `Conformément aux dispositions légales en vigueur relatives au droit à l’image, le MENJ s’engage à ce que la publication et la diffusion de l’image ainsi que des commentaires l’accompagnant `,
      doc.x - LIST_INDENT,
      undefined,
      { continued: true },
    )
    .font(FONT_BOLD)
    .text(
      `ne portent pas atteinte à sa vie privée, à sa dignité et à sa réputation. En vertu du Règlement général sur la protection des données (RGPD), entré en application le 25 mai 2018, le sujet ou son/ses représentant(s) légal/légaux dispose(ent) d’un libre accès aux photos concernant la personne mineure et a le droit de demander à tout moment le retrait de celles-ci*.`,
    );

  doc.moveDown();

  doc.font(FONT).text(`La présente autorisation est consentie à titre gratuit.`);

  doc.moveDown();

  doc.font(FONT_ITALIC).text(`${young.parent1FirstName} ${young.parent1LastName}`, { continued: true, paragraphGap: 10 });
  doc.text(hasParent2 ? `${young.parent2FirstName} ${young.parent2LastName}` : "", 200).font(FONT);
  doc.text(young.parent1ValidationDate ? `Validé le : ${datefns.format(young.parent1ValidationDate, "dd/MM/yyyy à HH:mm")}` : "", { continued: true });
  doc.text(young.parent2ValidationDate ? `Validé le : ${datefns.format(young.parent2ValidationDate, "dd/MM/yyyy à HH:mm")}` : "", 200);

  doc.moveDown(4);

  doc
    .font(FONT_ITALIC)
    .fontSize(7)
    .text(
      `* Conformément à la loi informatique et libertés du 6 janvier 1978, vous disposez d’un droit de libre accès, de rectification, de modification et de suppression des données qui vous concernent. Pour toute réclamation, vous pouvez adresser un mail à l’adresse : www.education.gouv.fr/contact-DPD ou courrier recommandé avec accusé de réception (accompagné des copies des photographies concernées, ou, pour une vidéo, de la copie d’écran), à l’adresse suivante : Ministère de l’Éducation nationale et de la Jeunesse - Secrétariat général - Délégation à la communication 110, rue de Grenelle - 75357 Paris Cedex 07. Votre demande doit être accompagnée de la photocopie d’un titre d’identité comportant votre signature. Si cette démarche reste sans réponse dans un délai de 2 mois ou en cas de réponse insatisfaisante, vous pouvez saisir la Cnil pour contester la diffusion de votre image.`,
      MARGIN,
    );
}

function generateDroitImage(outStream, young) {
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = new PDFDocument({
    layout: "portrait",
    size: "A4",
    margins: {
      top: MARGIN,
      bottom: 40,
      left: MARGIN,
      right: MARGIN,
    },
  });
  doc.pipe(outStream);
  render(doc, young);
  doc.end();
  console.timeEnd("RENDERING " + random);
}

module.exports = { generateDroitImage };
