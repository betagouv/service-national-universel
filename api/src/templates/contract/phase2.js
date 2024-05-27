const path = require("path");
const PDFDocument = require("pdfkit");
const config = require("config");
const { formatDateFRTimezoneUTC } = require("snu-lib");

const FONT = "Marianne";
const FONT_BOLD = `${FONT}-Bold`;
const FONT_ITALIC = `${FONT}_Italic`;

const FILL_COLOR = "#444";
const MARGIN = 50;
const LIST_INDENT = 15;
const FONT_SIZE_H1 = 18;
const FONT_SIZE_H2 = 14;
const FONT_SIZE = 11;

function _page1(doc) {
  const MARGIN = 20; //overwrite explicitly global MARGIN
  let _y, width;
  doc.addPage({
    size: "A4",
    margins: {
      top: 30,
      bottom: 20,
      left: 20,
      right: 20,
    },
  });
  const page = doc.page;

  doc.font(FONT);

  doc.moveDown(2);
  _y = doc.y;
  doc.image(path.join(config.IMAGES_ROOTDIR, "logo-snu.png"), 40, _y, { width: 60, height: 60 });

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H1).text("Contrat d’engagement en mission d’intérêt général (MIG) du service national universel (SNU)", 120, _y, {
    align: "center",
    width: 430,
  });

  doc.moveDown(4);

  doc.fontSize(FONT_SIZE).font(FONT).fillColor(FILL_COLOR);

  _y = doc.y;
  width = page.width - 2 * (MARGIN + 10);

  doc.moveDown(0.5);
  doc.text(
    `Le décret n° 2020-922 du 29 juillet 2020 portant dispositions diverses relatives au service national universel a créé une réserve thématique dénommée « Réserve du service national universel », régie par les dispositions de la loi du 27 janvier 2017 relative à l’égalité et à la citoyenneté.`,
    MARGIN + 10,
    doc.y,
    { width },
  );
  doc.moveDown(1);
  doc.text(
    `La réserve est ouverte aux mineurs âgés de quinze ans révolus satisfaisant aux conditions fixées par l'article 3 de la loi du 27 janvier 2017 susvisée et ayant participé au séjour de cohésion mentionné à l'article R. 113-1 du code du service national, qui accomplissent une mission d'intérêt général au titre du service national universel.`,
    { width },
  );
  doc.moveDown(1);
  doc.text(
    `La mission d’intérêt général revêt « un caractère philanthropique, éducatif, environnemental, scientifique, social, sportif ou culturel, ou concourent à des missions de défense et de sécurité civile ou de prévention ou à la prise de conscience de la citoyenneté française et européenne ».`,
    { width },
  );
  doc.moveDown(1);
  doc.text(
    `Les activités exercées dans ce cadre sont complémentaires des activités confiées aux personnels de l'organisme d'accueil et ne peuvent se substituer à la création d'un emploi ou au recrutement d'un stagiaire.`,
    { width },
  );
  doc.moveDown(1);
  doc.text(
    `La phase d’engagement du volontaire, à l’issue du séjour de cohésion, couvre une durée minimale de quatre-vingt-quatre heures, qui peut être accomplie en continu ou, dans la limite d’une période d’une année, de manière fractionnée.`,
    { width },
  );
  doc.moveDown(0.5);

  doc.rect(MARGIN, _y, page.width - 2 * MARGIN, doc.y - _y).stroke();
}

function _page2(doc, contract) {
  doc.addPage();

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H1).text(`Entre les soussignés,`, MARGIN);
  doc.moveDown(1);

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`L’Etat, représenté par`);
  doc.moveDown(1);
  doc.font(FONT).fontSize(FONT_SIZE);
  doc.font(FONT_BOLD).text(`${contract.projectManagerLastName} ${contract.projectManagerFirstName}`);
  if (contract.projectManagerRole) {
    doc.font(FONT).text(`agissant en qualité de `, { continued: true });
    doc.font(FONT_BOLD).text(contract.projectManagerRole);
  }
  if (contract.projectManagerEmail) {
    doc.font(FONT).text(`Email : `, { continued: true });
    doc.font(FONT_BOLD).text(contract.projectManagerEmail);
  }
  doc.moveDown(1);

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H1).text(`ET`);
  doc.moveDown(1);

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`La structure d’accueil représentée par`);
  doc.moveDown(1);
  doc.font(FONT).fontSize(FONT_SIZE);
  doc.font(FONT_BOLD).text(`${contract.structureManagerFirstName} ${contract.structureManagerLastName}`);
  if (contract.structureManagerRole) {
    doc.font(FONT).text(`agissant en qualité de `, { continued: true });
    doc.font(FONT_BOLD).text(contract.structureManagerRole);
  }
  if (contract.structureManagerEmail) {
    doc.font(FONT).text(`Email : `, { continued: true });
    doc.font(FONT_BOLD).text(contract.structureManagerEmail);
  }
  if (contract.structureSiret) {
    doc.font(FONT).text(`Siret : `, { continued: true });
    doc.font(FONT_BOLD).text(contract.structureSiret);
  }
  doc.moveDown(1);

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H1).text(`ET`);
  doc.moveDown(1);

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`Le volontaire`);
  doc.moveDown(1);
  doc.font(FONT).fontSize(FONT_SIZE);
  doc.font(FONT_BOLD).text(`${contract.youngFirstName} ${contract.youngLastName}`);
  if (contract.youngBirthdate) {
    doc.font(FONT).text(`Né(e) le : `, { continued: true });
    doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.youngBirthdate));
  }
  if (contract.youngAddress) {
    doc.font(FONT).text(`demeurant : `, { continued: true });
    doc.font(FONT_BOLD).text(`${contract.youngAddress} ${contract.youngCity} ${contract.youngDepartment}`);
  }
  if (contract.youngEmail) {
    doc.font(FONT).text(`Email : `, { continued: true });
    doc.font(FONT_BOLD).text(contract.youngEmail);
  }
  if (contract.youngPhone) {
    doc.font(FONT).text(`Téléphone : `, { continued: true });
    doc.font(FONT_BOLD).text(contract.youngPhone);
  }
  doc.moveDown(1);

  if (contract.isYoungAdult === "false") {
    doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`Représenté par ses représentants légaux`);
    doc.moveDown(1);
    doc.font(FONT).fontSize(FONT_SIZE);
    doc.text(`1) Le représentant légal du volontaire n°1 disposant de l’autorité parentale :`);
    doc.moveDown(0.5);
    if (contract.parent1LastName) {
      doc.font(FONT_BOLD).text(`${contract.parent1LastName} ${contract.parent1FirstName}`);
    }
    if (contract.parent1Address) {
      doc.font(FONT).text(`demeurant : `, { continued: true });
      doc.font(FONT_BOLD).text(`${contract.parent1Address} ${contract.parent1City} ${contract.parent1Department}`);
    }
    if (contract.parent1Email) {
      doc.font(FONT).text(`Email : `, { continued: true });
      doc.font(FONT_BOLD).text(contract.parent1Email);
    }
    if (contract.parent1Phone) {
      doc.font(FONT).text(`Téléphone : `, { continued: true });
      doc.font(FONT_BOLD).text(contract.parent1Phone);
    }
    doc.moveDown(1);

    if (contract.parent2Email) {
      doc.font(FONT);
      doc.text(`2) Le représentant légal du volontaire n°2 disposant de l’autorité parentale :`);
      doc.moveDown(0.5);
      if (contract.parent2LastName) {
        doc.font(FONT_BOLD).text(`${contract.parent2LastName} ${contract.parent2FirstName}`);
      }
      if (contract.parent2Address) {
        doc.font(FONT).text(`demeurant : `, { continued: true });
        doc.font(FONT_BOLD).text(`${contract.parent2Address} ${contract.parent2City} ${contract.parent2Department}`);
      }
      if (contract.parent2Email) {
        doc.font(FONT).text(`Email : `, { continued: true });
        doc.font(FONT_BOLD).text(contract.parent2Email);
      }
      if (contract.parent2Phone) {
        doc.font(FONT).text(`Téléphone : `, { continued: true });
        doc.font(FONT_BOLD).text(contract.parent2Phone);
      }
    }
  }
}

function _pageCharte(doc) {
  doc.addPage();

  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H1).text("CHARTE DE LA RÉSERVE CIVIQUE");
  doc.moveDown(2);

  // 1
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`1° Principes directeurs`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `La réserve civique permet à toute personne qui le souhaite de s'engager à servir les valeurs de la République en participant à des missions d'intérêt général, à titre bénévole et occasionnel.`,
  );
  doc.moveDown(1);
  doc.text(
    `La réserve civique, ses sections territoriales et les réserves thématiques qu'elle comporte favorisent la participation de tout citoyen à ces missions, dans un cadre collectif, ponctuel ou, à titre exceptionnel, récurrent, quelles que soient ses aptitudes et compétences. Elle concourt au renforcement du lien social en favorisant la mixité sociale.`,
  );
  doc.moveDown(1);
  doc.text(
    `Les domaines d'actions de la réserve civique, de ses sections territoriales et des réserves thématiques recouvrent des champs d'actions variés : la solidarité, l'éducation, la culture, la santé, l'environnement, le sport, la mémoire et la citoyenneté, la coopération internationale, la sécurité ou encore les interventions d'urgence en situation de crise ou d'événement exceptionnel.`,
  );
  doc.moveDown(1);
  doc.text(
    `La réserve civique est complémentaire des autres formes d'engagement citoyen que sont, d'une part, la garde nationale et les réserves opérationnelles et, d'autre part, l'engagement bénévole et volontaire.`,
  );
  doc.moveDown(2);

  // 2
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`2° Engagements et obligations des réservistes et des organismes d'accueil`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(`L'affectation à une mission nécessite l'accord de l'organisme d'accueil et du réserviste.`);
  doc.moveDown(1);

  doc.font(FONT_BOLD).text(`A. - Engagements et obligations des réservistes`).font(FONT);
  doc.moveDown(1);
  doc.text(
    `Sous réserve de satisfaire aux conditions légales et réglementaires qui régissent la réserve civique et ses sections territoriales et aux règles spécifiques propres aux réserves thématiques qu'elle comporte, peut être réserviste toute personne volontaire souhaitant s'engager dans le respect des principes directeurs de la réserve civique.`,
  );
  doc.moveDown(1);
  doc.text(`Toute personne qui participe à la réserve civique, ses sections territoriales ou l'une des réserves thématiques qu'elle comporte s'engage à :`);
  doc.moveDown(0.5);

  doc.list(
    [
      `respecter la présente charte ;`,
      `apporter son concours à titre bénévole ;`,
      `s'engager pour une période déterminée, qui peut être renouvelée avec son accord ;`,
      `accomplir la mission pour laquelle elle est mobilisée selon les instructions données par le responsable de l'organisme au sein duquel elle effectue sa mission (ou par toute personne que ce responsable a désignée) en tenant compte des règles de service et de fonctionnement ;`,
      `faire preuve d'une disponibilité adaptée aux exigences de son engagement ;`,
      `observer un devoir de réserve, de discrétion et de neutralité pendant l'exercice de sa mission ;`,
      `faire preuve de bienveillance envers toute personne en contact avec une mission de la réserve ;`,
      `rendre compte de sa mission à l'organisme qui l'accueille ;`,
      `signaler à l'autorité de gestion de la réserve compétente tout incident ou anomalie survenu à l'occasion de sa période d'engagement ;`,
      `promouvoir l'engagement citoyen sous toutes ses formes.`,
    ],
    MARGIN + LIST_INDENT,
    undefined,
    { bulletRadius: 1.5, textIndent: LIST_INDENT, baseline: -8 },
  );
  doc.moveDown(1);

  doc.font(FONT_BOLD).text(`B. - Engagements et obligations des organismes d'accueil`, MARGIN).font(FONT);
  doc.moveDown(1);
  doc.text(
    `Les organismes qui accueillent les réservistes sont les services de l'Etat, les personnes morales de droit public, notamment les établissements publics et les collectivités territoriales, ainsi que les organismes sans but lucratif de droit français qui portent un projet d'intérêt général, répondant aux orientations de la réserve civique et aux valeurs qu'elle promeut.`,
  );
  doc.moveDown(1);
  doc.text(
    `Une association cultuelle ou politique, une organisation syndicale, une congrégation, une fondation d'entreprise ou un comité d'entreprise ne peut accueillir de réserviste.`,
  );
  doc.moveDown(1);
  doc.text(
    `Les organismes éligibles proposent aux réservistes des missions compatibles avec leurs obligations professionnelles. Il ne peut être opposé à l'employeur une quelconque forme de réquisition.`,
  );
  doc.moveDown(1);
  doc.text(`Les missions impliquant une intervention récurrente de réservistes citoyens sont préalablement validées par l'autorité de gestion compétente de la réserve civique.`);
  doc.moveDown(1);
  doc.text(`Les organismes d'accueil s'engagent à :`);
  doc.moveDown(0.5);

  doc.list(
    [
      `respecter la présente charte ;`,
      `proposer des missions conformes à l'objet de la réserve civique, ses sections territoriales et ses réserves thématiques ;`,
      `proposer des missions non substituables à un emploi ou à un stage ;`,
      `préparer le réserviste à l'exercice de sa mission ;`,
      `prendre en considération les attentes, les compétences et les disponibilités exprimées par le réserviste au regard des besoins de la mission proposée ;`,
      `le cas échéant, compléter la convention d'engagement décrivant précisément la mission du réserviste (fréquence, lieu d'exercice, durée) ;`,
      `attester du déroulement de la mission ;`,
      `participer à des actions de communication, de sensibilisation et de promotion de la réserve civique ;`,
      `couvrir le réserviste contre les dommages subis par lui ou causés à des tiers dans l'accomplissement de sa mission.`,
    ],
    MARGIN + LIST_INDENT,
    undefined,
    { bulletRadius: 1.5, textIndent: LIST_INDENT, baseline: -8 },
  );
  doc.moveDown(1);
  doc.text(`Les organismes d'accueil peuvent par ailleurs rembourser les frais réellement engagés par le réserviste dans l'exercice de la mission qu'ils lui ont confiée.`, MARGIN);
  doc.moveDown(1);
  doc.text(
    `Tout manquement aux principes et engagements énoncés par la présente charte justifie qu'il soit mis fin à la participation de la personne ou de l'organisme concerné à la réserve civique, ses sections territoriales ou ses réserves thématiques.`,
  );
  doc.moveDown(1);
}

function render(doc, contract) {
  _page1(doc);

  _page2(doc, contract);

  if (new Date(contract.createdAd) < new Date("2024-03-14")) {
    _page3Old(doc, contract);
  } else {
    _page3(doc, contract);
  }

  _signature(doc, contract);
  doc.moveDown(2);

  _pageCharte(doc);
}

function _page3Old(doc, contract) {
  doc.addPage();

  doc.font(FONT).text(`Il a été convenu ce qui suit :`);
  doc.moveDown(2);

  // A
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`a) Objet`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc.font(FONT_BOLD).text(`${contract.youngLastName} ${contract.youngFirstName}`, { continued: true });
  doc.font(FONT).text(` s’engage à réaliser une mission d’intérêt général validée par l’autorité territoriale en charge du SNU, la mission : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.missionName);
  doc.moveDown(1);

  doc.font(FONT).text(`Les objectifs de la mission sont les suivants :`);
  doc.moveDown(0.5);
  doc.font(FONT_BOLD).text(contract.missionObjective);
  doc.moveDown(1);

  doc.font(FONT).text(`A ce titre, le volontaire exercera les activités suivantes :`);
  doc.moveDown(0.5);
  doc.font(FONT_BOLD).text(contract.missionAction);
  doc.moveDown(1);

  doc
    .font(FONT)
    .text(
      `La nature ou l’exercice des missions ne peuvent porter sur les activités relevant des articles D. 4153-15 à D. 4153-40 du code du travail c’est-à-dire les catégories de travaux définies en application de l’article L. 4153-8 du même code, interdites aux jeunes de moins de 18 ans, en ce qu’elles les exposeraient à des risques pour leur santé, leur sécurité, leur moralité ou excéderaient leurs forces.`,
    );
  doc.moveDown(2);

  // B
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`b) Date d’effet et durée du contrat`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc
    .font(FONT)
    .text(`Le présent contrat, pour la réalisation de la mission indiquée ci-dessus, prend effet à la date de signature du présent contrat par les trois parties prenantes.`);
  doc.moveDown(1);

  doc.font(FONT).text(`La mission d’intérêt général débute le `, { continued: true });
  doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.missionStartAt), { continued: true });
  doc.font(FONT).text(` jusqu'au `, { continued: true });
  doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.missionEndAt));
  doc.moveDown(1);

  doc.font(FONT).text(`Le volontaire effectuera un total de `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.missionDuration} heures`, { continued: true });
  doc.font(FONT).text(` de MIG.`);
  doc.moveDown(2);

  doc.addPage();

  // C
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`c) Conditions d’exercice des missions`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc.font(FONT).text(`La mission s’effectue à `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.missionAddress}, ${contract.missionZip} ${contract.missionCity}`, { continued: true });
  doc.font(FONT).text(` au sein de la structure d’accueil retenue par l’administration : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.structureName, { continued: true });
  doc
    .font(FONT)
    .text(
      `. La durée quotidienne de la mission est égale à sept heures au maximum. Une pause de trente minutes doit être appliquée pour toute période de mission ininterrompue atteignant quatre heures et demie. Les missions effectuées entre 22 heures et 6 heures sont interdites. Pour les missions effectuées de manière continue, le repos hebdomadaire est de deux jours consécutifs au minimum. Si le volontaire est scolarisé, la mission ne peut être effectuée sur le temps scolaire. Si le volontaire travaille, le temps de travail cumulé avec le temps d’accomplissement de la mission d’intérêt général ne peut excéder 7 heures par jour et 35 heures par semaine.`,
    );
  doc.moveDown(1);

  doc.font(FONT).text(`Les horaires du volontaire pour la présente mission sont : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.missionFrequence);
  doc.moveDown(1);

  doc.font(FONT).text(`Le volontaire bénéficie, pour assurer l’accomplissement de sa mission, de l’accompagnement d’un tuteur de mission `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.structureManagerLastName} ${contract.structureManagerFirstName}`, { continued: true });
  doc
    .font(FONT)
    .text(
      ` de la structure d’accueil. Le volontaire bénéficie, par son tuteur, d’entretiens réguliers permettant un suivi de la réalisation des missions ainsi que, le cas échéant, d’un accompagnement renforcé.`,
    );
  doc.moveDown(2);

  // D
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`d) Obligations réciproques des parties`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `L’Etat s’engage à identifier les missions susceptibles d’être proposées au volontaire dans le cadre des missions d’intérêt général. L’Etat s’assure de la qualité des conditions de réalisation de cette mission au regard des finalités du SNU. Enfin, l’Etat valide la réalisation de la mission du volontaire. La structure d’accueil s’engage à proposer des missions permettant la mobilisation du volontaire en faveur de l’intérêt général. Un mentor est nommé au sein de la structure afin de s’assurer du suivi du volontaire et de la qualité des conditions de son accueil.`,
  );
  doc.moveDown(1);

  doc.text(
    `Le cas échéant, la structure d’accueil précise les frais qu’elle entend prendre en charge, totalement ou partiellement, dans le cadre de la mission d’intérêt général (frais de transports, repas, hébergement...).`,
  );
  doc.moveDown(1);
  doc.moveDown(1);
  doc.text(
    `Le volontaire s’engage à respecter le règlement intérieur de la structure qui l’accueille, à respecter les personnes, le matériel et les locaux et à agir en conformité avec les exigences de son engagement dans le cadre du SNU : ponctualité, politesse, implication. Le volontaire est tenu à la discrétion pour les faits et informations dont il a connaissance dans l’exercice de ses missions. Il est également tenu aux obligations de convenance et de réserve inhérentes à ses fonctions.`,
  );
  doc.moveDown(1);
  doc.text(`Le volontaire exécute la mission d’intérêt général à titre bénévole.`);
  doc.moveDown(1);
  doc.text(
    `L'engagement, l'affectation et l'activité du volontaire ne sont régis ni par le code du travail, ni par le chapitre Ier de la loi n° 84-16 du 11 janvier 1984 portant dispositions statutaires relatives à la fonction publique de l'Etat, le chapitre Ier de la loi n° 84-53 du 26 janvier 1984 portant dispositions statutaires relatives à la fonction publique territoriale ou le chapitre Ier de la loi n° 86-33 du 9 janvier 1986 portant dispositions statutaires relatives à la fonction publique hospitalière. Le cas échéant, la structure d’accueil, directement ou par le mentor désigné, informe le représentant de l’Etat, signataire du présent contrat, des difficultés rencontrées dans l’exécution du présent contrat.`,
  );
  doc.moveDown(1);
  doc.text(
    `Conformément aux dispositions du décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel, le volontaire et la structure d’accueil s’engagent à respecter les principes directeurs ainsi que les engagements et obligations des réservistes et des structures d’accueil énoncés par la charte de la réserve civique, annexée au présent contrat, dans sa version issue du décret n° 2017-930 du 9 mai 2017.`,
  );
  doc.moveDown(2);

  //E
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`e) Journée de fin de mission d'intérêt général`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `Une journée de fin de mission d’intérêt général est organisée, en dehors des heures de MIG mentionnées au b), pour préparer une éventuelle participation du volontaire à la phase III du SNU, soit un engagement volontaire de plusieurs mois, notamment dans le cadre du service civique ou du volontariat des armées. La participation du volontaire est requise.`,
  );

  // F
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`f) Responsabilités`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `La structure d’accueil est chargée de la surveillance et de la sécurité du volontaire accueilli. L'organisme d'accueil le couvre des dommages subis par lui ou causés à des tiers dans l'accomplissement de sa mission.`,
  );
  doc.moveDown(2);

  // G
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`g) Résiliation du contrat`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `Le présent contrat de mission d’intérêt général peut être résilié moyennant un préavis d’une journée sauf en cas de force majeure ou de faute grave d’une des parties. Avant de résilier le contrat, la structure d’accueil prévient le représentant de l’Etat.`,
  );
  doc.moveDown(2);

  // H
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`h) Conditions de validation de la mission d’intérêt général`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `La confirmation de la réalisation de la mission d'intérêt général est effectuée par le tuteur de mission qui, au nom de la structure d'accueil, effectue la procédure de fin de mission sur la plateforme.`,
  );
  doc.moveDown(1);
  doc.text(
    `La validation est conditionnée à la réalisation de 84 heures de mission au minimum au sein de la structure. La mission est accomplie de manière continue, ou dans la limite de la période d’une année, de manière discontinue.`,
  );
  doc.moveDown(1);
  doc.text(`Réalisé le ${formatDateFRTimezoneUTC(contract.date)}.`);
  doc.moveDown(1);
  doc.moveDown(1);
}

function _page3(doc, contract) {
  doc.addPage();

  doc.font(FONT).text(`Il a été convenu ce qui suit :`);
  doc.moveDown(2);

  // A
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`a) Objet`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc.font(FONT_BOLD).text(`${contract.youngLastName} ${contract.youngFirstName}`, { continued: true });
  doc.font(FONT).text(` s’engage à réaliser une mission d’intérêt général validée par l’autorité territoriale de gestion de la réserve du SNU : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.missionName);
  doc.moveDown(1);

  doc.font(FONT).text(`Les objectifs de la mission sont les suivants :`);
  doc.moveDown(0.5);
  doc.font(FONT_BOLD).text(contract.missionObjective);
  doc.moveDown(1);

  doc.font(FONT).text(`A ce titre, le volontaire exercera les activités suivantes :`);
  doc.moveDown(0.5);
  doc.font(FONT_BOLD).text(contract.missionAction);
  doc.moveDown(1);

  doc
    .font(FONT)
    .text(
      `La nature ou l’exercice des missions ne peuvent porter sur les activités relevant des articles D. 4153-15 à D. 4153-40 du code du travail c’est-à-dire les catégories de travaux définies en application de l’article L. 4153-8 du même code, interdites aux jeunes de moins de 18 ans, en ce qu’elles les exposeraient à des risques pour leur santé, leur sécurité, leur moralité ou excéderaient leurs forces.`,
    );
  doc.moveDown(2);

  // B
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`b) Date d’effet et durée du contrat`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc
    .font(FONT)
    .text(`Le présent contrat, pour la réalisation de la mission indiquée ci-dessus, prend effet à la date de signature du présent contrat par les trois parties prenantes.`);
  doc.moveDown(1);

  doc.font(FONT).text(`La mission d’intérêt général débute le `, { continued: true });
  doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.missionStartAt), { continued: true });
  doc.font(FONT).text(` jusqu'au `, { continued: true });
  doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.missionEndAt));
  doc.moveDown(1);

  doc.font(FONT).text(`Le volontaire effectuera un total de `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.missionDuration} heures`, { continued: true });
  doc.font(FONT).text(` de MIG.`);
  doc.moveDown(2);

  doc.addPage();

  // C
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`c) Conditions d’exercice des missions`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE);

  doc.font(FONT).text(`La mission s’effectue à `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.missionAddress}, ${contract.missionZip} ${contract.missionCity}`, { continued: true });
  doc.font(FONT).text(` au sein de la structure d’accueil retenue par l’administration : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.structureName, { continued: true });
  doc
    .font(FONT)
    .text(
      `. La durée quotidienne de la mission est égale à huit heures au maximum. Une pause de trente minutes doit être appliquée pour toute période de mission ininterrompue atteignant quatre heures et demie. Les missions effectuées entre 22 heures et 6 heures sont interdites. Pour les missions effectuées de manière continue, le repos hebdomadaire est de deux jours consécutifs au minimum. Si le volontaire est scolarisé, la mission ne peut être effectuée sur le temps scolaire. Si le volontaire travaille, le temps de travail cumulé avec le temps d’accomplissement de la mission d’intérêt général ne peut excéder 8 heures par jour et 35 heures par semaine.`,
    );
  doc.moveDown(1);

  doc.font(FONT).text(`Les horaires du volontaire pour la présente mission sont : `, { continued: true });
  doc.font(FONT_BOLD).text(contract.missionFrequence);
  doc.moveDown(1);

  doc.font(FONT).text(`Le volontaire bénéficie, pour assurer l’accomplissement de sa mission, de l’accompagnement d’un tuteur de mission `, { continued: true });
  doc.font(FONT_BOLD).text(`${contract.structureManagerLastName} ${contract.structureManagerFirstName}`, { continued: true });
  doc
    .font(FONT)
    .text(
      ` de la structure d’accueil. Le volontaire bénéficie, par son tuteur, d’entretiens réguliers permettant un suivi de la réalisation des missions ainsi que, le cas échéant, d’un accompagnement renforcé.`,
    );
  doc.moveDown(2);

  // D
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`d) Obligations réciproques des parties`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `L’Etat, représenté par le directeur académique des services de l’Education nationale, valide la mission d’intérêt général et s’assure de la qualité des conditions de réalisation de cette mission au regard des finalités du SNU.`,
  );
  doc.moveDown(1);
  doc.text(
    `La structure d’accueil s’engage à proposer des missions permettant la mobilisation du volontaire en faveur de l’intérêt général. Un tuteur est nommé au sein de la structure afin de s’assurer du suivi du volontaire et de la qualité des conditions de son accueil.`,
  );
  doc.moveDown(1);
  doc.text(
    `Le cas échéant, la structure d’accueil précise les frais qu’elle entend prendre en charge, totalement ou partiellement, dans le cadre de la mission d’intérêt général (frais de transports, repas, hébergement...).`,
  );
  doc.moveDown(1);
  doc.text(
    `Le volontaire s’engage à respecter le règlement intérieur de la structure qui l’accueille, à respecter les personnes, le matériel et les locaux et à agir en conformité avec les exigences de son engagement dans le cadre du SNU : ponctualité, politesse, implication. Le volontaire est tenu à la discrétion pour les faits et informations dont il a connaissance dans l’exercice de ses missions. Il est également tenu aux obligations de convenance et de réserve inhérentes à ses fonctions.`,
  );
  doc.moveDown(1);
  doc.text(`Le volontaire exécute la mission d’intérêt général à titre bénévole.`);
  doc.moveDown(1);
  doc.text(
    `L'engagement, l'affectation et l'activité du volontaire ne sont régis ni par le code du travail, ni par le chapitre Ier de la loi n° 84-16 du 11 janvier 1984 portant dispositions statutaires relatives à la fonction publique de l'Etat, le chapitre Ier de la loi n° 84-53 du 26 janvier 1984 portant dispositions statutaires relatives à la fonction publique territoriale ou le chapitre Ier de la loi n° 86-33 du 9 janvier 1986 portant dispositions statutaires relatives à la fonction publique hospitalière.`,
  );
  doc.moveDown(1);
  doc.text(
    `Le cas échéant, la structure d’accueil, directement ou par le tuteur désigné, informe le représentant de l’Etat, signataire du présent contrat, des difficultés rencontrées dans l’exécution du présent contrat.`,
  );
  doc.moveDown(1);
  doc.text(
    `Conformément aux dispositions du décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au service national universel, le volontaire et la structure d’accueil s’engagent à respecter les principes directeurs ainsi que les engagements et obligations des réservistes et des structures d’accueil énoncés par la charte de la réserve civique, annexée au présent contrat, dans sa version issue du décret n° 2017-930 du 9 mai 2017.`,
  );
  doc.moveDown(2);

  // E
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`e) Responsabilités`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `La structure d’accueil est chargée de la surveillance et de la sécurité du volontaire accueilli. L'organisme d'accueil le couvre des dommages subis par lui ou causés à des tiers dans l'accomplissement de sa mission.`,
  );
  doc.moveDown(2);

  // F
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`f) Résiliation du contrat`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `Le présent contrat de mission d’intérêt général peut être résilié moyennant un préavis d’une journée sauf en cas de force majeure ou de faute grave d’une des parties. Avant de résilier le contrat, la structure d’accueil prévient le représentant de l’Etat.`,
  );
  doc.moveDown(2);

  // G
  doc.font(FONT_BOLD).fontSize(FONT_SIZE_H2).text(`g) Conditions de validation de la mission d’intérêt général`);
  doc.moveDown(1);
  doc.fontSize(FONT_SIZE).font(FONT);

  doc.text(
    `La confirmation de la réalisation de la mission d'intérêt général est effectuée par le tuteur de mission qui, au nom de la structure d'accueil, effectue la procédure de fin de mission sur la plateforme.`,
  );
  doc.moveDown(1);
  doc.moveDown(1);
}

function _badge(doc, status) {
  let text = "En attente de validation";
  let color = "#FE7B52";
  if (status === "VALIDATED") {
    text = "Validé";
    color = "#6CC763";
  }
  const width = doc.widthOfString(text) + 10;
  const height = doc.heightOfString(text);
  doc.strokeColor(color).lineWidth(1).roundedRect(doc.x, doc.y, width, height, 10).stroke();
  doc.fillColor(color).fontSize(12).text(text, { width, height, align: "center", paragraphGap: 5 });
  doc.fontSize(FONT_SIZE_H2).fillColor(FILL_COLOR);
}

function _signature(doc, contract) {
  doc.addPage();

  doc.fontSize(FONT_SIZE_H2).text("Réalisé le ", { continued: true });
  doc.font(FONT_BOLD).text(formatDateFRTimezoneUTC(contract.date));

  doc.moveDown(3);

  doc.font(FONT);
  let _y = doc.y;

  const COL1 = MARGIN;
  const COL2 = 300;

  doc.text("Représentant de l'état", COL1, _y);
  doc.text(`${contract.projectManagerLastName} ${contract.projectManagerFirstName}`);
  _badge(doc, contract.projectManagerStatus);
  if (contract.projectManagerValidationDate) {
    doc.text(formatDateFRTimezoneUTC(contract.projectManagerValidationDate));
  }

  doc.text("Représentant structure", COL2, _y);
  doc.text(`${contract.structureManagerLastName} ${contract.structureManagerFirstName}`);
  _badge(doc, contract.structureManagerStatus);
  if (contract.structureManagerValidationDate) {
    doc.text(formatDateFRTimezoneUTC(contract.structureManagerValidationDate));
  }

  doc.moveDown(3);

  _y = doc.y;
  if (contract.isYoungAdult == "true") {
    doc.text("Volontaire", COL1, _y);
    doc.text(`${contract.youngContractLastName} ${contract.youngContractFirstName}`);
    _badge(doc, contract.youngContractStatus);
    if (contract.youngContractValidationDate) {
      doc.text(formatDateFRTimezoneUTC(contract.youngContractValidationDate));
    }
  } else {
    doc.text("Représentant légal 1", COL1, _y);
    doc.text(`${contract.parent1LastName} ${contract.parent1FirstName}`);
    _badge(doc, contract.parent1Status);
    if (contract.parent1ValidationDate) {
      doc.text(formatDateFRTimezoneUTC(contract.parent1ValidationDate));
    }
    if (contract.parent2Email && contract.parent2LastName) {
      doc.text("Représentant légal 2", COL2, _y);
      doc.text(`${contract.parent2LastName} ${contract.parent2FirstName}`);
      _badge(doc, contract.parent2Status);
      if (contract.parent2ValidationDate) {
        doc.text(formatDateFRTimezoneUTC(contract.parent2ValidationDate));
      }
    }
  }
}

function initDocument() {
  const doc = new PDFDocument({
    layout: "portrait",
    size: "A4",
    margins: {
      top: MARGIN + 10,
      bottom: MARGIN,
      left: MARGIN,
      right: MARGIN,
    },
    autoFirstPage: false,
  });

  doc.registerFont(FONT, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular.woff"));
  doc.registerFont(FONT_BOLD, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Bold.woff"));
  doc.registerFont(FONT_ITALIC, path.join(config.FONT_ROOTDIR, "Marianne/Marianne-Regular_Italic.woff"));

  return doc;
}

function generateContractPhase2(outStream, contract) {
  const random = Math.random();
  console.time("RENDERING " + random);
  const doc = initDocument();
  doc.pipe(outStream);
  render(doc, contract);
  doc.end();
  console.timeEnd("RENDERING " + random);
}

module.exports = { generateContractPhase2 };
