const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];

const sessions2023 = [
  {
    id: "2023_02_C",
    name: "Février 2023 - C",
    dateStart: new Date("02/19/2023"),
    dateEnd: new Date("03/03/2023"),
    buffer: 1.7,
    event: "Phase0/CTA preinscription - sejour fevrier C",
    eligibility: {
      zones: ["C"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("03/04/2005"),
      bornBefore: new Date("02/20/2008"),
      inscriptionEndDate: new Date("2023-01-11T23:59:00.000Z"), // = 8 janv, date format US
      instructionEndDate: new Date("2023-01-11T23:59:00.000Z"), // = 8 janv, date format US
    },
  },
  {
    id: "2023_04_A",
    name: "Avril 2023 - A",
    dateStart: new Date("04/09/2023"),
    dateEnd: new Date("04/21/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour avril A",
    eligibility: {
      zones: ["A"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("04/22/2005"),
      bornBefore: new Date("04/10/2008"),
      inscriptionEndDate: new Date("2023-02-12T23:59:00.000Z"), // = 12 fev
      instructionEndDate: new Date("2023-02-15T23:59:00.000Z"), // = 15 fev
    },
  },
  {
    id: "2023_04_B",
    name: "Avril 2023 - B",
    dateStart: new Date("04/16/2023"),
    dateEnd: new Date("04/28/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour avril B",
    eligibility: {
      zones: ["B", "Corse"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("04/29/2005"),
      bornBefore: new Date("04/17/2008"),
      inscriptionEndDate: new Date("2023-02-26T23:59:00.000Z"),
      instructionEndDate: new Date("2023-03-01T23:59:00.000Z"),
    },
  },
  {
    id: "2023_06",
    name: "Juin 2023",
    dateStart: new Date("06/11/2023"),
    dateEnd: new Date("06/23/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour juin",
    eligibility: {
      zones: ["DOM"],
      schoolLevels: ["NOT_SCOLARISE", "2ndeGT", "Autre"],
      bornAfter: new Date("06/24/2005"),
      bornBefore: new Date("06/12/2008"),
      inscriptionEndDate: new Date("2023-04-24T23:59:00.000Z"),
      instructionEndDate: new Date("2023-05-01T23:59:00.000Z"),
    },
  },
  {
    id: "2023_07",
    name: "Juillet 2023",
    dateStart: new Date("07/04/2023"),
    dateEnd: new Date("07/16/2023"),
    buffer: 99999,
    event: "Phase0/CTA preinscription - sejour juillet",
    eligibility: {
      zones: ["A", "B", "C", "DOM", "Etranger"],
      schoolLevels: ["NOT_SCOLARISE", "4eme", "3eme", "2ndePro", "2ndeGT", "1erePro", "1ereGT", "TermPro", "TermGT", "CAP", "Autre"],
      bornAfter: new Date("07/17/2005"),
      bornBefore: new Date("07/05/2008"),
      inscriptionEndDate: new Date("2023-05-08T23:59:00.000Z"), // 8 mai
      instructionEndDate: new Date("2023-05-12T23:59:00.000Z"), // 12 mai
    },
  },
];

module.exports = {
  sessions2023,
  oldSessions,
};
