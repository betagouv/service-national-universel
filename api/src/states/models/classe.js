const { STATUS_CLASSE, YOUNG_STATUS, SENDINBLUE_TEMPLATES } = require("snu-lib");
const ClasseModel = require("../../models/cle/classe");
const CohortModel = require("../../models/cohort");
const emailsEmitter = require("../../emails");

const ClasseStateManager = {};

ClasseStateManager.compute = async (_id, fromUser, options) => {
  const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
  if (!YoungModel) throw new Error("YoungModel is required");

  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.status === STATUS_CLASSE.WITHDRAWN) return classe;

  // Get cohort
  const classeCohort = await CohortModel.findOne({ name: classe.cohort });
  if (!classeCohort) throw new Error("Cohort not found");

  // Get students
  const students = await YoungModel.find({ classeId: classe._id }).lean();
  const studentValidated = students.filter((student) => student.status === YOUNG_STATUS.VALIDATED);

  const seatsTaken = studentValidated.length;
  classe.set({ seatsTaken });

  const now = new Date();
  const inscriptionStartDate = new Date(classeCohort.inscriptionStartDate);
  const inscriptionEndDate = new Date(classeCohort.inscriptionEndDate);

  // Open
  const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
  if ([STATUS_CLASSE.VALIDATED, STATUS_CLASSE.CLOSED].includes(classe.status) && isInscriptionOpen) {
    classe.set({ status: STATUS_CLASSE.OPEN });
    classe = await classe.save({ fromUser });
    //TODO : send email to referent
    return classe;
  }

  // Closed
  const seatsValidated = studentValidated.length;
  const isInscriptionClosed = now > inscriptionEndDate;
  if ((classe.status !== STATUS_CLASSE.CLOSED && isInscriptionClosed) || classe.totalSeats === seatsValidated) {
    classe.set({ status: STATUS_CLASSE.CLOSED });
    classe = await classe.save({ fromUser });

    emailsEmitter.emit(SENDINBLUE_TEMPLATES.CLE.CLASSE_VALIDATED, classe);
    return classe;
  }

  await classe.save({ fromUser });

  return classe;
};

ClasseStateManager.withdraw = async (_id, fromUser, options) => {
  const YoungModel = options?.YoungModel; // Prevent circular dependency in YoungModel post save hook
  if (!YoungModel) throw new Error("YoungModel is required");

  let classe = await ClasseModel.findById(_id);
  if (!classe) throw new Error("Classe not found");
  if (classe.status === STATUS_CLASSE.WITHDRAWN) throw new Error("Classe already withdrawn");

  // Withdraw classe
  classe.set({ status: STATUS_CLASSE.WITHDRAWN });
  classe = await classe.save({ fromUser });

  // Set all students in "Inscription abandonnée"
  const students = await YoungModel.find({
    classeId: classe._id,
    status: { $in: [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.VALIDATED] },
  });
  await Promise.all(
    students.map((s) => {
      s.set({
        status: YOUNG_STATUS.ABANDONED,
        lastStatusAt: Date.now(),
        withdrawnMessage: "classe désistée",
        withdrawnReason: "other",
      });
      return s.save({ fromUser });
    }),
  );

  return classe;
};

module.exports = ClasseStateManager;
